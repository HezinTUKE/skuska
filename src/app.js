const mysql = require('mysql2');
const express = require('express');
const body_parser = require("body-parser"); 
const hbs = require("hbs");
hbs.registerPartials(__dirname + "/views/partials");

const app = express();
const bodyParser = body_parser.urlencoded({extended : false}); //budeme ziskavat data z formy pomocou body-parser

app.set("view engine", "hbs"); //ukazeme ze budeem pracovat s Handlebars (.hbs)

//pripojime sa ku databaze (MySQL)
const connection = mysql.createConnection({
	host: "localhost",
	database: "mydb",
	user: "root",
	password: "root"
});

//testneme pripojenie
connection.connect(function(err){
	if(err) console.error(err);
	else console.log("Connected!!!");
});

//-----------------------------------------------------KNIŽNICA-------------------------------------------

app.get("/library", function(req, res){
	connection.query("SELECT * FROM library ORDER BY address ASC", function(err, data){
		if(err) return console.error(err);
		res.render("library.hbs",{
			librarys : data
		});
	});
});

app.get("/create", function(req, res){
	res.render("create.hbs");
});

app.post("/create", bodyParser, function(req, res){
	
	if(!bodyParser) return res.sendStatus(400);
	const phone = req.body.phone;
	const email = req.body.email;
	const address = req.body.address;

	connection.query("INSERT INTO library (phone, email, address) VALUES (?, ?, ?)", [phone, email, address], function(err){
		if(err) return console.error(err);
		res.redirect("/library");
	});
});

app.post("/delete/:id", function(req, res){
	const id = req.params.id;
	connection.query("DELETE FROM library WHERE id = ?" , [id] , function(err){
		if(err) return console.log(err);
		res.redirect("/library");	
	});
});

app.get("/edit/:id", function(req, res){
	const id = req.params.id;
	connection.query("SELECT * FROM library WHERE id = ?" , [id], function(err, data){
		if(err) return console.error(err);
		res.render("edit.hbs", {
			library : data[0]
		});
	});
});

app.post("/edit", bodyParser, function(req, res){
	if(!bodyParser) return res.status(400);
	const id = req.body.id;
	const phone = req.body.phone;
	const email = req.body.email;
	const address = req.body.address;

	connection.query("UPDATE library SET phone = ?, email = ?, address = ? WHERE id = ?", [phone, email, address, id], function(err){
		if(err) return console.log(err);
		res.redirect("/library");
	});
});

//-----------------------------------------------------KNIŽNICA-------------------------------------------

//-----------------------------------------------------ŠTUDENTI-------------------------------------------

app.get("/library/:id/students", function(req, res){
	const id = req.params.id;
	connection.query("SELECT * FROM student WHERE id_library = ? ORDER BY surname ASC", [id], function(err, data){
		if(err) return console.log(err);
		res.render("student.hbs", {
			library_id : id,
			students : data
		})
	});
});

app.post("/library/:id_library/students/delete/:id", function(req, res){
	const id = req.params.id;
	const id_library = req.params.id_library;
	connection.query("DELETE FROM student WHERE id = ?", [id], function(err){
		if(err) return console.log(err);
		res.redirect("/library/" + id_library + "/students");
	});
});

app.get("/library/:id_library/students/create", function(req, res){
	res.render("newstudent.hbs");
});

app.post("/library/:id_library/students/create", bodyParser, function(req, res){
	if(!bodyParser) return res.status(400);
	const name = req.body.name;
	const surname = req.body.surname;
	const phone = req.body.phone;
	const email = req.body.email;

	const id_library = req.params.id_library;

	connection.query("INSERT INTO student (name, surname, phone, email, id_library) VALUES (?, ?, ?, ?, ?)", [name, surname, phone, email, id_library], function(err){
		if(err) return console.log(err);
		res.redirect("/library/" + id_library + "/students");
	});
});

app.get("/library/:id_library/students/edit/:id", function(req, res){
	const id = req.params.id;
	const id_library = req.params.id_library;
	connection.query("SELECT * FROM student WHERE id = ?", [id], function(err, data){
		if(err) return console.log(err);
		res.render("editstudent.hbs", {
			id_library : id_library,
			student : data[0]
		});
	});
});

app.post("/library/:id_library/students/edit", bodyParser, function(req, res){
	if(!bodyParser) return res.status(400);
	const id = req.body.id;
	const name = req.body.name;
	const surname = req.body.surname;
	const phone = req.body.phone;
	const email = req.body.email;

	const id_library = req.params.id_library;

	connection.query("UPDATE student SET name = ?, surname = ?, phone = ?, email = ? WHERE id = ?", 
		[name, surname, phone, email, id], function(err){
			if(err) return console.log(err);
			res.redirect("/library/" + id_library + "/students");
		});
});

//-----------------------------------------------------ŠTUDENTI-------------------------------------------


//-----------------------------------------------------KNIHA-------------------------------------------

app.get("/library/:id/books", function(req, res){
	const id_libr = req.params.id;
	connection.query("SELECT * FROM book WHERE id_library = ? ORDER BY name ASC", [id_libr], function(err, data){
		if(err) return console.log(err);
		res.render("books.hbs",{
			id_library:id_libr,
			books:data
		});
	});
});

app.get("/library/:id/books/create", function(req, res){
	res.render("createbook.hbs");
});

app.post("/library/:id/books/create", bodyParser, function(req, res){
	
	if(!bodyParser) return res.status(400);
	const name = req.body.name;
	const author = req.body.author;

	const id = req.params.id;

	connection.query("INSERT INTO book (name, author, id_library) VALUES (?, ?, ?)", [name, author, id], function(err, data){
		if(err) return console.log(err);
		res.redirect("/library/"+ id + "/books");
	});
});

app.post("/library/:id/books/delete/:id_book", function(req, res){
	const id = req.params.id;
	const id_book = req.params.id_book;

	connection.query("DELETE FROM book WHERE id = ? AND id_library = ?", [id_book, id], function(err){
		if(err) return console.log(err);
		res.redirect("/library/"+ id + "/books");
	});
});

app.get("/library/:id/books/edit/:id_book", function(req, res){
	const id = req.params.id;
	const id_book = req.params.id_book;

	connection.query("SELECT * FROM book WHERE id = ? AND id_library = ?", [id_book, id], function(err, data){
		if(err) return console.log(err);
		res.render("editbook.hbs", {
			id_library : id, 
			book : data[0]
		});
	});

});

app.post("/library/:id/books/edit", bodyParser, function(req, res){
	if(!bodyParser) return res.status(400);
	const id_book = req.body.id;
	const name = req.body.name;
	const author = req.body.author;

	const id = req.params.id;

	connection.query("UPDATE book SET name = ?, author = ? WHERE id = ? ", 
		[name, author, id_book], function(err){
			if(err) return console.log(err);
			res.redirect("/library/"+ id + "/books");
		});
}); 

//-----------------------------------------------------KNIHA-------------------------------------------

//-----------------------------------------------------REFERENCIA-------------------------------------------

app.get("/library/:id_library/students/:id/book", function(req, res){
	const history = req.query.history;
	const id_library = req.params.id_library;
	const id_student = req.params.id;
	connection.query("SELECT * FROM book INNER JOIN ref_book_student AS ref ON book.id = ref.id_book AND book.id_library = ? AND ref.returned = ? ORDER BY book.name ASC", [id_library, Boolean(history)], function(err, data){
		if(err) return console.log(err);
		res.render("ref.hbs", {
			id_library : id_library,
			id_student : id_student,
			refs : data
		});
	});
});

app.get("/library/:id_library/students/:id/book/create", function(req, res){
	res.render("createref.hbs");
});

//vytvorime novu referenciu
app.post("/library/:id_library/students/:id/book/create", bodyParser, function(req, res){
	if(!bodyParser) return res.status(400);
	const book_name = req.body.nbook;
	const author = req.body.author;
	const term = req.body.days;

	const id_student = req.params.id;
	const id_library = req.params.id_library;

	const select_book = "SELECT * FROM book WHERE name = ? AND author = ? AND id_library = ?"; //ziskame vsetke knihy
	const insert_ref = "INSERT INTO ref_book_student (id_student, id_book, taken, returning, returned) VALUES (?, ?, ?, ?, ?) "; //vytvarame referenciu
	const check_contains = "SELECT * FROM book INNER JOIN ref_book_student AS ref ON book.id = ref.id_book AND book.id = ? AND ref.returned = ?"; // kontrola

	//hladame knihu ktoru chceme dat studentovi ked kniha neexistuje v kniznice tak vzskoci report
	connection.query(select_book, [book_name, author, id_library], function(err, data){
		if(err) return console.log(err);
		if(data.length > 0){

			let id_book = data[0].id;
			//ked kniha je v kniznice tak kontrolujeme ci student ju neprevzial uz 
			connection.query(check_contains, [id_book, false], function(err, book){
				if(book.length > 0){
					res.render("report.hbs", {
						report : "This student already has this book."
					}); 
				}else{
					let today = new Date();
			
					let m = Math.floor(term / 30) + 1;
					let d = m == 1 ? Number(term) : term - (30* (m-1))

					const taken = today.getFullYear()+'-'+(today.getMonth() + 1)+'-'+(today.getDate() + 1);
					const _return = today.getFullYear()+'-'+(today.getMonth() + m)+'-'+(today.getDate() + d);
					
					//ked nie tak vytvarame referenciu
					connection.query(insert_ref, [id_student, id_book, taken, _return, false], function(err){
						if(err) return console.log(err);
						res.redirect("/library/" + id_library + "/students/" + id_student + "/book");
					});
				}
			});
		}else res.render("report.hbs", {
			report : "This book is not available in this library"
		}); 
	});
});

app.post("/library/:id_library/students/:id/book/return/:id_ref", function(req, res){
	const id_library = req.params.id_library;
	const id_student = req.params.id;
	const id_ref = req.params.id_ref;
	connection.query("UPDATE ref_book_student SET returned = ? WHERE id = ?", [true, id_ref], 
	function(err){
		if(err) return console.log(err);
		res.redirect("/library/" + id_library + "/students/" + id_student + "/book");
	});
});

//-----------------------------------------------------REFERENCIA-------------------------------------------

app.listen(3000);