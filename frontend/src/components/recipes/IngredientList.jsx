import './IngredientList.css';

function IngredientList({ fields, register, remove, append, errors }) {
  const handleAddIngredient = () => {
    append({ name: '', quantity: '', unit: '' });
  };

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
                className={errors?.ingredients?.[index]?.name ? 'input-error' : ''}
              />
              {errors?.ingredients?.[index]?.name && (
                <span className="field-error">{errors.ingredients[index].name.message}</span>
              )}
            </div>

            <div className="ingredient-field ingredient-quantity">
              <input
                type="text"
                placeholder="Qty (e.g., 2)"
                {...register(`ingredients.${index}.quantity`)}
                className={errors?.ingredients?.[index]?.quantity ? 'input-error' : ''}
              />
              {errors?.ingredients?.[index]?.quantity && (
                <span className="field-error">{errors.ingredients[index].quantity.message}</span>
              )}
            </div>

            <div className="ingredient-field ingredient-unit">
              <input
                type="text"
                placeholder="Unit (e.g., cups)"
                {...register(`ingredients.${index}.unit`)}
                className={errors?.ingredients?.[index]?.unit ? 'input-error' : ''}
              />
              {errors?.ingredients?.[index]?.unit && (
                <span className="field-error">{errors.ingredients[index].unit.message}</span>
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

      {errors?.ingredients?.message && (
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
}

export default IngredientList;
