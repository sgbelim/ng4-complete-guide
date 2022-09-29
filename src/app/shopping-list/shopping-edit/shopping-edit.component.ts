import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Ingredient} from "../../shared/ingredient.model";
import {NgForm} from "@angular/forms";
import {Store} from "@ngrx/store";
import * as ShoppingListActions from '../store/shopping-list.actions';
import {Subscription} from "rxjs";
import * as fromApp from '../../store/app.reducers';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {

  @ViewChild('form') shoppingForm: NgForm;

  editMode = false;
  editItem: Ingredient;
  private subscription: Subscription;

  constructor(private store: Store<fromApp.AppState>) {
  }

  ngOnInit(): void {

    this.subscription = this.store.select('shoppingList').subscribe(stateData => {

      if (stateData.editIngredientIndex > -1) {
        this.editMode = true;
        this.editItem = stateData.editIngredient;

        this.shoppingForm.setValue({
          name: this.editItem.name,
          amount: this.editItem.amount
        })
      } else {
        this.editMode = false
      }
    })
  }

  onAddItem() {
    const value = this.shoppingForm.value;

    const ingredientName = value.name;
    const ingredientAmount = value.amount;
    const newIngredient = new Ingredient(ingredientName, ingredientAmount);

    if (this.editMode) {
      this.store.dispatch(new ShoppingListActions.UpdateIngredient(newIngredient));
    } else {
      this.store.dispatch(new ShoppingListActions.AddIngredient(newIngredient));
    }

    this.editMode = false;
    this.shoppingForm.reset();
  }

  onClear() {
    this.shoppingForm.reset();
    this.editMode = false;
    this.store.dispatch(new ShoppingListActions.StopEdit())
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ShoppingListActions.StopEdit())
    this.subscription.unsubscribe();
  }

  onDelete() {
    this.store.dispatch(new ShoppingListActions.DeleteIngredients())
    this.onClear();
  }
}
