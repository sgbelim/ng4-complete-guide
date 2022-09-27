import {Injectable} from '@angular/core';
import {Recipe} from "./recipe.model";
import {Ingredient} from "../shared/ingredient.model";
import {ShoppinglistService} from "../shopping-list/shoppinglist.service";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RecipeService {

  recipesChanged = new Subject<Recipe[]>();

  private recipes: Recipe[] = [];

  /*private recipes: Recipe[] = [
    new Recipe(
      "Tasty Schnitzel",
      "A super tasty Schnitzel - just awesome!",
      "https://images.immediate.co.uk/production/volatile/sites/30/2013/05/Puttanesca-fd5810c.jpg",
      [
        new Ingredient('Meat', 1),
        new Ingredient('French Fries', 20)
      ]),
    new Recipe(
      "Awesome KO burger",
      "What else you need to say",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzSli5eI_njQ7qA0Q1A22y4266HOBI11QEXg&usqp=CAU",
      [
        new Ingredient('Buns', 2),
        new Ingredient('Meat', 1)])
  ];*/

  constructor(private shoppingListService: ShoppinglistService) {
  }

  setRecipes(recipes: Recipe[]) {
    this.recipes = recipes;
    this.recipesChanged.next(this.recipes.slice());
  }

  getRecipes() {
    return this.recipes.slice();
  }

  getRecipe(id: number) {
    return this.recipes[id];
  }

  addIngredientToShoppingList(ingredients: Ingredient[]) {
    this.shoppingListService.addIngredients(ingredients);
  }

  addRecipe(recipe: Recipe) {
    this.recipes.push(recipe);
    this.recipesChanged.next(this.recipes.slice());
  }

  updateRecipe(index: number, newRecipe: Recipe) {
    this.recipes[index] = newRecipe;
    this.recipesChanged.next(this.recipes.slice());
  }

  deleteRecipe(index: number) {
    this.recipes.splice(index, 1);
    this.recipesChanged.next(this.recipes.slice());
  }
}
