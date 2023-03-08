const models = require("../models/models");
const Recipe = models.Recipe;
const User = models.User;

const recipeController = {};

//MIGHT NEED TO DEBGUG FOR &q= AT THE END
const baseURL = 'https://api.edamam.com/api/recipes/v2?type=public&app_id=df53c42b&app_key=42722d0f8c7171ba43d1b261ca01b673&ingr=1%2B&field=label&field=image&field=shareAs&field=yield&field=dietLabels&field=healthLabels&field=cautions&field=calories&field=totalNutrients&q='
//str.replaceAll(" ", "%20");



const calculateRelevance = (recipeMacros, userMacros) => {
  //recipesMacros, userMacros = [calories, carbs, fat, protein] -> [2000, 125g, 250g, 125g]
  // invoke convert to proportions to get percentages ie -> [2000, .25, .5, .25];
  let normalizedRecipe = normalizeRecipe(recipeMacros);
  let relevance =
    Math.abs(normalizedRecipe[1] - userMacros[1]) +
    Math.abs(normalizedRecipe[2] - userMacros[2]) +
    Math.abs(normalizedRecipe[3] - userMacros[3]);
  //smaller the better, i.e. more relevant
  //console.log('this is relevance', relevance, normalizedRecipe[1], userMacros[1], normalizedRecipe[2], userMacros[2], normalizedRecipe[3], userMacros[3])
  return relevance;
};

const normalizeRecipe = (macros) => {
  let kcal = macros[0];
  //might need to debug to add up to 100
  let carbs = ((4 * macros[1]) / kcal).toFixed(2)*100;
  let fat = ((9 * macros[2]) / kcal).toFixed(2)*100;
  let protein = (4 * macros[3]) / kcal.toFixed(2)*100;
  // if (carbs + fat + protein !== 1) {
  //   console.log("went over 100!");
  // }

  return [kcal, carbs, fat, protein];
};


recipeController.saveRecipes = async (req, res, next) => {
  // save recipe to the collection in mongoose
  const url = baseURL + req.body.queryString; //url going to the fetch
  const response = await fetch(url);
  const jsonResponse = await response.json();
  const recipes = jsonResponse.hits;

  for (const recipe of recipes) {
    const { label } = recipe.recipe;
    // check for if recipe is in collection
    let recipeInDB = await Recipe.exists({ label });
    if (!recipeInDB) {
      // create recipe document if not in collection
      const { label, image, shareAs, yield, dietLabels, healthLabels, cautions, calories, totalNutrients } = recipe.recipe;
      const { FAT, CHOCDF, PROCNT } = totalNutrients;
      const fat = FAT.quantity;
      const carbs = CHOCDF.quantity;
      const protein = PROCNT.quantity;
      await Recipe.create({ label, image, shareAs, yield, dietLabels, healthLabels, cautions, calories, fat, carbs, protein });
    }
  }
}







recipeController.sortRecipes = async (req, res, next) => {

  const username = req.cookies.username;
  const user = await User.findOne({ username });
  const userMacros = [
    user.calorieGoal,
    user.carbGoal,
    user.fatGoal,
    user.proteinGoal,
  ];
{
    recipe.relevance = calculateRelevance(recipeMacros, userMacros);
  }

  recipes.sort((a, b) => a.relevance - b.relevance);
  let count = 1;
  for(const recipe of recipes){  
    console.log(`Recipes ordered by relevance ${count++}.`, recipe.recipe.label, recipe.relevance)
  }
  res.locals.recipes = recipes; // array of recipes sorted based on relevance

  return next();
};



recipeController.deleteRecipe = (req, res, next) => {};

module.exports = recipeController;

// kcal 2000
// carbs 30 => 150g of carbs
// fat 30 => 67 g of fats
// protein 40 => 200g of proteins

// 3 recipes to Collection

// kcal 1500
// carbs 40 => 150g of carbs
// fat 30 => 50g of fats
// protein 30 => 112.5g of proteins
