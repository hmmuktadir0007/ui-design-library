"""Negative tests: validate() must reject deliberately broken copies of the dataset.

Works on in-memory deep copies; the production styles.json is never modified.
Usage: python -m unittest scripts/test_validate_styles.py
"""
import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from validate_styles import PDF, PPTX, ROOT, validate, validate_against_sources  # noqa: E402

PUBLIC = ROOT / "public"
BASE = json.loads((ROOT / "src" / "data" / "styles.json").read_text(encoding="utf-8"))


class ValidateRejects(unittest.TestCase):
    def errors_for(self, mutate, public=PUBLIC):
        data = copy.deepcopy(BASE)
        mutate(data)
        return "\n".join(validate(data, public)[0])

    def test_baseline_passes(self):
        self.assertEqual(validate(copy.deepcopy(BASE), PUBLIC)[0], [])

    def test_duplicate_id(self):
        self.assertIn("duplicate ids: [1]", self.errors_for(lambda d: d[1].update(id=1)))

    def test_missing_id(self):
        self.assertIn("missing ids: [50]", self.errors_for(lambda d: d.pop()))

    def test_invalid_category(self):
        self.assertIn("invalid category 'Retro'", self.errors_for(lambda d: d[0].update(categoryTab="Retro")))

    def test_invalid_palette_value(self):
        self.assertIn("invalid palette colour 'rgba/0.22'", self.errors_for(lambda d: d[0]["palette"].__setitem__(0, "rgba/0.22")))

    def test_missing_image_reference(self):
        self.assertIn("missing/invalid imagePath", self.errors_for(lambda d: d[0].pop("imagePath")))

    def test_missing_image_file(self):
        with tempfile.TemporaryDirectory() as empty:
            self.assertIn("style 1: missing or unreadable image", self.errors_for(lambda d: None, Path(empty)))

    def test_wrong_metadata_type(self):
        self.assertIn("optional era has wrong type", self.errors_for(lambda d: d[0].update(era=1980)))
        self.assertIn("missing/invalid id", self.errors_for(lambda d: d[0].update(id="1")))

    def test_palette_name_length_mismatch(self):
        self.assertIn("paletteNames has 4 entries for 5 colours", self.errors_for(lambda d: d[0]["paletteNames"].pop()))

    def test_duplicate_image_reference(self):
        self.assertIn("duplicate imagePath", self.errors_for(lambda d: d[1].update(imagePath=d[0]["imagePath"])))


@unittest.skipUnless(PPTX.exists() and PDF.exists(), "private source deck not present")
class SourceFidelityRejects(unittest.TestCase):
    def test_edited_prompt_and_palette_name(self):
        data = copy.deepcopy(BASE[:2])
        data[0]["aiPrompt"] += " (improved)"
        data[1]["paletteNames"][0] = "X"
        errors = validate_against_sources(data)[0]
        self.assertIn("style 1: aiPrompt differs from source", errors)
        self.assertIn("style 2: paletteNames differs from source", errors)


if __name__ == "__main__":
    unittest.main()
