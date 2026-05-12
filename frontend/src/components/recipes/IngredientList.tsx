import React from 'react';
import { UseFormRegister, FieldErrors, UseFieldArrayRemove, UseFieldArrayAppend } from 'react-hook-form';
import './IngredientList.css';

interface IngredientField {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface IngredientListProps {
  fields: IngredientField[];
  register: UseFormRegister<any>;
  remove: UseFieldArrayRemove;
  append: UseFieldArrayAppend<any>;
  errors: FieldErrors<any>;
}

const IngredientList: React.FC<IngredientListProps> = ({
  fields,
  register,
  remove,
  append,
  errors
}) => {
  const handleAddIngredient = (): void => {
    append({ name: '', quantity: '', unit: '' });
  };

  // Cast ingredients errors to any to allow array indexing
  const ingredientErrors = errors?.ingredients as any;

  return (
    <div className="ingredient-list">
      <label className="ingredient-list-label">Ingredients *</label>

      {fields.map((field, index) => (
        <div key={field.id} className="ingredient-row">
          <div className="ingredient-inputs">
            <div className="ingredient-field ingredient-name">
              <input
                type="text"
                placeholder="Ingredient (e.g., Flour)"
                {...register(`ingredients.${index}.name`)}
                className={ingredientErrors?.[index]?.name ? 'input-error' : ''}
              />
              {ingredientErrors?.[index]?.name && (
                <span className="field-error">{ingredientErrors[index]?.name?.message}</span>
              )}
            </div>

            <div className="ingredient-field ingredient-quantity">
              <input
                type="text"
                placeholder="Qty (e.g., 2)"
                {...register(`ingredients.${index}.quantity`)}
                className={ingredientErrors?.[index]?.quantity ? 'input-error' : ''}
              />
              {ingredientErrors?.[index]?.quantity && (
                <span className="field-error">{ingredientErrors[index]?.quantity?.message}</span>
              )}
            </div>

            <div className="ingredient-field ingredient-unit">
              <input
                type="text"
                placeholder="Unit (e.g., cups)"
                {...register(`ingredients.${index}.unit`)}
                className={ingredientErrors?.[index]?.unit ? 'input-error' : ''}
              />
              {ingredientErrors?.[index]?.unit && (
                <span className="field-error">{ingredientErrors[index]?.unit?.message}</span>
              )}
            </div>
          </div>

          {fields.length > 1 && (
            <button
              type="button"
              className="remove-ingredient-btn"
              onClick={() => remove(index)}
              aria-label="Remove ingredient"
            >
              ×
            </button>
          )}
        </div>
      ))}

      {errors?.ingredients?.message && typeof errors.ingredients.message === 'string' && (
        <span className="list-error">{errors.ingredients.message}</span>
      )}

      <button
        type="button"
        className="add-ingredient-btn"
        onClick={handleAddIngredient}
      >
        + Add Ingredient
      </button>
    </div>
  );
};

export default IngredientList;
