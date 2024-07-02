const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

var conString = config.urlConnection;
var client = new Client(conString);
client.connect((err) => {
    if (err) {
        return console.error('Não foi possível conectar ao banco.', err);
    }
    client.query('SELECT NOW()', (err, result) => {
        if (err) {
            return console.error('Erro ao executar a query.', err);
        }
        console.log(result.rows[0]);
    });
});

app.get("/", (req, res) => {
    console.log("Response ok.");
    res.send("Ok – Servidor disponível.");
});



app.get("/republica", (req, res) => {
    try {
        client.query("SELECT * FROM republica", function
            (err, result) {
            if (err) {
                return console.error("Erro ao executar a qry de SELECT", err);
            }
            res.send(result.rows);
            console.log("Rota: get republica");
        });
    } catch (error) {
        console.log(error);
    }
});

app.get("republica/:id", (req, res) => {
    try {
        console.log("Rota: repuplica/" + req.params.id);
        client.query(
            "SELECT * FROM Usuarios WHERE id = $1", [req.params.id],
            (err, result) => {
                if (err) {
                    return console.error("Erro ao executar a qry de SELECT id", err);
                }
                res.send(result.rows);
            }
        );
    } catch (error) {
        console.log(error);
    }
});


app.post("/republica", (req, res) => {
    try {
        console.log("Alguém enviou um post com os dados:", req.body);
        const { q1, q2, q3, q4, q5, q6, q7, q8, q9, q10 } = req.body;
        client.query(
            "INSERT INTO republica (q1, q2, q3, q4, q5, q6, q7, q8, q9, q10) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
            [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10],
            (err, result) => {
                if (err) {
                    console.error("Erro ao executar a qry de INSERT", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
                const { id } = result.rows[0];
                res.setHeader("id", `${id}`);
                res.status(201).json(result.rows[0]);
                console.log(result);
            }
        );
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(config.port, () =>
 console.log("Servidor funcionando na porta " + config.port)
);

module.exports = app; 