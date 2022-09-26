import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Ingredient} from "../../shared/ingredient.model";
import {ShoppinglistService} from "../shoppinglist.service";
import {NgForm} from "@angular/forms";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {

  @ViewChild('form') shoppingForm: NgForm;

  subscription: Subscription;
  editMode = false;
  editItemIndex: number;
  editItem: Ingredient;

  /*
    @ViewChild("nameInput", {static: true}) nameInputRef: ElementRef;
    @ViewChild("amountInput", {static: true}) amountInputRef: ElementRef;
  */

  constructor(private shoppingListService: ShoppinglistService) {
  }

  ngOnInit(): void {

    this.subscription = this.shoppingListService.startedEditing.subscribe(
      (index: number) => {
        this.editMode = true;
        this.editItemIndex = index;
        this.editItem = this.shoppingListService.getIngredient(index);

        this.shoppingForm.setValue({
          name: this.editItem.name,
          amount: this.editItem.amount
        })

      }
    )
  }

  onAddItem() {
    const value = this.shoppingForm.value;

    const ingredientName = value.name;
    const ingredientAmount = value.amount;
    const newIngredient = new Ingredient(ingredientName, ingredientAmount);

    if (this.editMode) {
      this.shoppingListService.updateIngredient(this.editItemIndex, newIngredient);

    } else {
      this.shoppingListService.addIngredient(newIngredient);
    }

    this.editMode = false;
    this.shoppingForm.reset();
  }

  onClear() {
    this.shoppingForm.reset();
    this.editMode = false;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onDelete() {
    this.shoppingListService.deleteIngredient(this.editItemIndex);
    this.onClear();
  }
}
