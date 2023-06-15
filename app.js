//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));




                 // creating DATABSE


mongoose.connect("mongodb+srv://virustrojangoku:Arth4094@cluster0.q9xjbud.mongodb.net/todolistDB");

const itemsSchema = {
  name : String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist."
});

const item2 = new Item({
  name: "Hit + to add item"
});

const item3 = new Item({
  name: "--> Click here to delete item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems).then((res) => {
//   console.log("Successfully saved default items to DB.");
// });

// Item.deleteOne({_id:"6487197e22f8a9b40fa574cb"}).then((res) => {
//   console.log("Deleted");
// });


                       // creating DATABASE





app.get("/", function(req, res) {

  Item.find({}).then((foundItems) => {
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems).then((res) => {
        console.log("Successfully saved default items to DB.");
      });
      res.redirect("/");
    } else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});

}
  });



});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName}).then((foundList) => {
    if(!foundList){ // create a new list
      const list = new List ({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    } else { // show an existing list
      // console.log("exists");
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  });

  // list.find({})
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}).then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.deleteOne({_id: checkedItemId}).then((res) => {
      console.log("Item deleted");
    });
    res.redirect("/");

  }  else {
        List.findOneAndUpdate({name:listName},{$pull: {items: {_id:checkedItemId}}}).then((foundList) => {
            res.redirect("/" + listName);
        });
  }

});


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
