const express = require('express')
const app = express()
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const cocktailAPI = `https://www.thecocktaildb.com/api/json/v1/1/`
var fetch = require('node-fetch')


app.engine('mustache', mustacheExpress())
app.set('views','./views')
app.set('view engine','mustache')

app.use(bodyParser.urlencoded({extended : false}))
//pp.use('/jquery', express.static('jQuery.js'))



app.post('/getCocktail', function(req, res){
    let serchTerm = req.body.query
    console.log(serchTerm)
    fetch(cocktailAPI + "search.php?s=" + serchTerm).then(res => res.json()).then(json => {
      //console.log(json)

      json.drinks.map(function(drink){

          drink.ingredients = [] 
          

          Object.keys(drink).map(function(key,value){
            if(key.startsWith("strIngredient")) {
              if(drink[key] != "") {
                drink.ingredients.push(drink[key])
              }
            }
          })

          

      })
      console.log("HOLA")

      //console.log(drink.ingredients)
      res.render('result', {drinks: json.drinks})
      
    })
   
})

// app.get('/result', function(req,res){
//     //res.render('result', {json})
// })

app.get('/search', function(req, res){
    res.render('search')
})

app.post('/login', function(req,res){
  res.redirect('login')
})

app.get('/login', function(req,res){
  res.render('login')
})

app.listen(3000,function(req,res){
  console.log("server is running")
})
