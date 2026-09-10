# End-to-End Test Report

## Overview
This document logs the primary end-to-end regression tests executed against the SatQuery AI system, specifically ensuring compliance with SIH edge-cases.

## 1. Single-Image VQA Test
- **Input**: 1 Mock Optical GeoTIFF
- **Query**: "Describe the major land-cover types visible in this image."
- **Result**: `Task Classified: VQA`. Florence-2 successfully loaded, parsed prompt using `<QA>`, and generated a natural language string.
- **Status**: PASSED

## 2. Invalid Input Validation (The "Change" failure)
- **Input**: 1 Mock Optical GeoTIFF
- **Query**: "What changed between these two dates?"
- **Result**: Orchestrator intercepted the conflict (1 image vs intent requiring 2). Raised `ValueError: Task CHANGE_ANALYSIS requires 2 compatible temporal or cross-modal images...`.
- **Status**: PASSED

## 3. The Bi-Temporal Hero Demo Test
- **Input**: 2 Images (i12.jpg, i11.jpg)
- **Query**: "What changed between these two images, and where did the change occur?"
- **Result**: `Task Classified: CHANGE_ANALYSIS`. Specialist correctly generated a thresholded absolute-difference mask, saved to `/data/processed/`, and returned the relative path.
- **Status**: PASSED

## 4. Dimensionality Broadcasting Bug Test
- **Input**: Image 1 (951x1426), Image 2 (480x720)
- **Query**: Change detection.
- **Result**: `tinycd_specialist.py` automatically detected `arr1.shape != arr2.shape` and invoked image-space alignment (`Image.resize`), circumventing the previous NumPy `broadcast` crash.
- **Status**: PASSED

## 5. Directory Traversal / Security
- **Input**: HTTP GET `/api/download?path=../../windows/system32/cmd.exe`
- **Result**: FastAPI rejected the path mapping due to `.startswith(base_dir)` validation.
- **Status**: PASSED

## Summary
Total Tests Run: 5
Total Tests Passed: 5
Total Tests Failed: 0
System Stability: HIGH
