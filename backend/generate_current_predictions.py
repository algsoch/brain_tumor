#!/usr/bin/env python3
"""
Generate predictions CSV for current images in the image folder
"""
import sys
from pathlib import Path
import pandas as pd
from PIL import Image
import numpy as np

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from services.model_service import model_service

def main():
    print("=" * 60)
    print("Generating predictions for current images")
    print("=" * 60)
    
    image_folder = Path(__file__).parent.parent / 'image'
    image_files = sorted(
        list(image_folder.glob('*.jpg')) + 
        list(image_folder.glob('*.jpeg')) + 
        list(image_folder.glob('*.png'))
    )
    
    print(f"\nFound {len(image_files)} images in {image_folder}")
    print("Starting predictions... (this will take a few minutes)\n")
    
    results = []
    for idx, img_path in enumerate(image_files):
        if idx % 50 == 0:
            print(f"Progress: {idx}/{len(image_files)} ({idx/len(image_files)*100:.1f}%)")
        
        try:
            # Get true label from filename
            true_label = 'tumor' if 'cancer_(' in img_path.name else 'healthy'
            class_id = 1 if true_label == 'tumor' else 0
            
            # Load and predict
            img = Image.open(img_path)
            img_array = model_service.preprocess_image(img)
            prediction = model_service.predict(img_array)
            
            predicted_class = int(np.argmax(prediction[0]))
            confidence = float(prediction[0][predicted_class])
            pred_label = 'tumor' if predicted_class == 1 else 'healthy'
            is_correct = (predicted_class == class_id)
            
            results.append({
                'filepath': str(img_path),
                'filename': img_path.name,
                'label': true_label,
                'class_id': class_id,
                'predicted_class': predicted_class,
                'prediction': pred_label,
                'confidence': confidence,
                'correct': is_correct
            })
        except Exception as e:
            print(f"❌ Error processing {img_path.name}: {e}")
    
    # Save to CSV
    df = pd.DataFrame(results)
    output_path = Path(__file__).parent.parent / 'model_training_phase' / 'current_predictions.csv'
    df.to_csv(output_path, index=False)
    
    correct_count = df[df['correct'] == True].shape[0]
    incorrect_count = df[df['correct'] == False].shape[0]
    
    print(f"\n{'=' * 60}")
    print("✅ COMPLETE!")
    print(f"{'=' * 60}")
    print(f"Total predictions: {len(results)}")
    print(f"Correct: {correct_count} ({correct_count/len(results)*100:.2f}%)")
    print(f"Incorrect: {incorrect_count} ({incorrect_count/len(results)*100:.2f}%)")
    print(f"\nSaved to: {output_path}")
    print(f"{'=' * 60}\n")

if __name__ == '__main__':
    main()
