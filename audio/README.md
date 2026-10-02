# 韩语合成音频 / Korean synthesized audio

928 clips cover all authored vocabulary pronunciations, the 40 letter demonstrations (shared syllables reuse a clip), and starter syllables. These are synthesized demonstrations, not recordings made by a teacher. Files are mono AAC in M4A containers, about 10.2 MB in total. Only letter/starter clips are precached; vocabulary clips are cached after playback.

Generated on 2026-10-02 with Piper 1.8.0 and the **rhasspy/Piper ko_KR-kss-medium** voice, 22,050 Hz; converted to 48 kbps AAC. The model itself is not distributed here. `sources.json` maps each clip to the exact text used; `scripts/generate-audio.py` documents generation.

Attribution and sources:

- Voice model: [rhasspy/piper-voices, ko_KR/kss/medium](https://huggingface.co/rhasspy/piper-voices/tree/main/ko/ko_KR/kss/medium).
- [Voice model card](https://huggingface.co/rhasspy/piper-voices/blob/main/ko/ko_KR/kss/medium/MODEL_CARD).
- Training dataset: [Korean Single Speaker Speech Dataset (KSS), Bryan Park](https://www.kaggle.com/datasets/bryanpark/korean-single-speaker-speech-dataset), identified by the model card as **CC BY-NC-SA 4.0**.
- Audio in this directory is provided under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/). Retain this attribution and license when sharing adaptations. The changes consist of synthesizing the application's Korean study prompts and AAC encoding; no endorsement by the model or dataset authors is implied.

This audio license is separate from the application source and Google Material Symbols license. System speech remains available from the playback troubleshooting controls and for freely composed syllables without a packaged clip.
