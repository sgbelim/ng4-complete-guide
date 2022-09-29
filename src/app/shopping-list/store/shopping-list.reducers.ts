import {Ingredient} from "../../shared/ingredient.model";
import *  as ShoppingListActions from "./shopping-list.actions";

export interface State {
  ingredients: Ingredient[];
  editIngredient: Ingredient,
  editIngredientIndex: number
}

const initialState: State = {
  ingredients: [
    new Ingredient("Apples", 5),
    new Ingredient("Tomatoes", 10)
  ],
  editIngredient: null,
  editIngredientIndex: -1
}

export function ShoppingListReducers(state: State = initialState,
                                     action: ShoppingListActions.ShoppingListActions) {

  switch (action.type) {

    case ShoppingListActions.ADD_INGREDIENT:

      return {
        ...state,
        ingredients: [...state.ingredients, action.payload]
      }

    case ShoppingListActions.ADD_INGREDIENTS:
      const ingredients = [...action.payload];

      return {
        ...state,
        ingredients: [...state.ingredients, ...ingredients]
      }

    case ShoppingListActions.UPDATE_INGREDIENT:

      const ingredient = state.ingredients[state.editIngredientIndex];
      const updatedIngredient = {
        ...ingredient,
        ...action.payload
      };

      const updatedIngredients = [...state.ingredients];
      updatedIngredients[state.editIngredientIndex] = updatedIngredient;

      return {
        ...state,
        ingredients: updatedIngredients,
        editIngredientIndex: -1,
        editIngredient: null
      };

    case ShoppingListActions.DELETE_INGREDIENT:

      return {
        ...state,
        ingredients: state.ingredients.filter((ig, igIndex) => {
          return igIndex !== state.editIngredientIndex
        }),
        editIngredientIndex: -1,
        editIngredient: null
      };

    case ShoppingListActions.START_EDIT:

      return {
        ...state,
        editIngredientIndex: action.payload,
        editIngredient: {...state.ingredients[action.payload]}
      }

    case ShoppingListActions.STOP_EDIT:

      return {
        ...state,
        editIngredient: null,
        editIngredientIndex: -1
      }
    default:
      return state;
  }

}
