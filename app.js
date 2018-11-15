const express = require('express')
const app = express()
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const cocktailAPI = `https://www.thecocktaildb.com/api/json/v1/1/`
var fetch = require('node-fetch')


app.engine('mustache', mustacheExpress())
app.set('views', './views')
app.set('view engine', 'mustache')

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use('/drinksite', express.static('css'))



app.post('/getSingleCocktail', function (req, res) {
  let drinkID = req.body.drinkID
  fetch(cocktailAPI + "lookup.php?i=" + drinkID).then(res => res.json()).then(json => {
    json.drinks.map(function (drink) {
      drink.drinkIngredients = []
      drink.ingredients = []
      drink.proportions = []


      Object.keys(drink).map(function (key, value) {

        if (key.startsWith("strIngredient")) {
          if (drink[key] != '' && drink[key] != null && drink[key] != ' ') {
            drink.ingredients.push({
              ingredient: drink[key]
            })
          }
        }
        if (key.startsWith("strMeasure")) {
          if (drink[key] != '' && drink[key] != null && drink[key] != ' ') {
            drink.proportions.push({
              proportion: drink[key]
            })

          }

        }
      })

      for (i = 0; i < drink.ingredients.length; i++) {
        if (drink.proportions[i] == undefined) {
          drink.proportions[i] = "nothing m8"
        }
        drink.drinkIngredients.push({
          proportion: drink.proportions[i].proportion,
          ingredient: drink.ingredients[i].ingredient
        })
        console.log(drink.drinkIngredients[i])
      }


    })
    res.render('drink', {
      drinks: json.drinks
    })
  })
})

app.post('/getCocktails', function (req, res) {
  let serchTerm = req.body.query

  fetch(cocktailAPI + "search.php?s=" + serchTerm).then(res => res.json()).then(json => {
    //console.log(json)

    json.drinks.map(function (drink) {
      drink.drinkIngredients = []
      drink.ingredients = []
      drink.proportions = []


      Object.keys(drink).map(function (key, value) {

        if (key.startsWith("strIngredient")) {
          if (drink[key] != '' && drink[key] != null && drink[key] != ' ') {
            drink.ingredients.push({
              ingredient: drink[key]
            })
          }
        }
        if (key.startsWith("strMeasure")) {
          if (drink[key] != '' && drink[key] != null && drink[key] != ' ') {
            drink.proportions.push({
              proportion: drink[key]
            })

          }

        }
      })

      for (i = 0; i < drink.ingredients.length; i++) {
        if (drink.proportions[i] == undefined) {
          drink.proportions[i] = "nothing m8"
        }
        drink.drinkIngredients.push({
          proportion: drink.proportions[i].proportion,
          ingredient: drink.ingredients[i].ingredient
        })
        
      }


    })



    //console.log(drink.ingredients)
    res.render('result', {
      drinks: json.drinks
    })

  })

})

// app.get('/result', function(req,res){
//     //res.render('result', {json})
// })

app.get('/search', function (req, res) {
  res.render('search')
})

app.post('/login', function (req, res) {
  res.redirect('login')
})

app.get('/login', function (req, res) {
  res.render('login')
})

app.listen(3000, function (req, res) {
  console.log("server is running")
})