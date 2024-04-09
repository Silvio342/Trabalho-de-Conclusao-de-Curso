const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const path = require('path');
const cors = require("cors");
const axios = require('axios');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {}
});
const port = 3000;

// Configuração do MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chat'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Conectado ao banco de dados MySQL');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    /*
    db.query('SELECT COUNT(*) AS users from users',(err, results) => {
        if (err){
            res.json({err: "Erro na BD"});
        }
        res.json(results);
    });
    */
    res.sendFile(join(__dirname, "index.html"));
});

//----------------------------------------- Cadastro
app.post('/cadastro', (req, res) => {
    const { username, name, email, password, language } = req.body;


    // Verifica se o usuário já existe no banco de dados
    db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, results) => {
        if (err) {
            res.status(500).json({ erro: 'Erro no banco de dados, tente novamente.' });
        }
        
        if (results.length > 0) {
            // Usuário já existe
            res.status(400).json({ erro: 'Nome de usuário ou email já está em uso no sistema.' });
        } else {
            // Inserir dados no banco de dados
            db.query('INSERT INTO users (username, name, email, password, language) VALUES (?, ?, ?, ?, ?)', [username, name, email, password, language], (err, result) => {
                if (err) {
                    res.status(500).json({ message: 'Erro no banco de dados, tente novamente.' });
                }
                res.json({ message: "Usuário criado com sucesso" });
            });

        }
    });
});

//----------------------------------------- Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log(req.body)
    // Consulta ao banco de dados para verificar as credenciais de login
    db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, result) => {
        if (err) {
            res.status(500).json({ erro: 'Erro no banco de dados, tente novamente.' });
        }

        if (result.length > 0) {
            const id = result[0].pk_user_id;
            res.json({ user_id: id });
        } else {
            // Credenciais incorretas
            res.status(401).json({ message: 'Nome de usuário ou senha incorretos' });
        }
    });
});

//----------------------------------------- Home
app.get('/home/:id', (req, res) => {
    const id = req.params.id;

    db.query(`SELECT * FROM users WHERE pk_user_id = ${id}`, (err, result) => {
        if (err) {
            res.status(500).json({ erro: 'Erro no banco de dados, tente novamente.' });
        }
        var dados_perfil = result;
        db.query(`SELECT * FROM users WHERE pk_user_id != ${id}`, (err, result) => {
            if (err) {
                throw err;
            }
            let lista_de_users = result;
            res.json({
                dados_perfil: dados_perfil,
                lista_contactos: lista_de_users
            });

        })
    });


});

app.get("/home/messages/send/:userId", (req, res) => {

    db.query('SELECT msg FROM messages WHERE fk_sender_id = ?', [req.params.userId], (err, results) => {
        if (err) { socket.emit('chat message', "Erro ao apresentar as mensagens"); }
        if (results.length > 0) {
            res.json(results);
        } else {
            let arrobj = [];
            arrobj.push({ msg: "Não há mensagem nessa conversa"});
            res.json(arrobj)
        }

    });
});

app.get("/home/messages/receive/:userId", (req, res) => {

    db.query('SELECT msg FROM messages WHERE fk_reciever_id = ?', [req.params.userId], (err, results) => {
        if (err) { socket.emit('chat message', "Erro ao apresentar as mensagens"); }
        if (results.length > 0) {
            res.json(results);
        } else {
            let arrobj = [];
            arrobj.push({ msg: "Não há mensagem nessa conversa"});
            res.json(arrobj)
        }

    });
});

app.get("/home/messages/:userId", (req, res) => {

    db.query('SELECT msg, fk_sender_id, fk_reciever_id FROM messages WHERE fk_sender_id = ? OR fk_reciever_id = ?', [req.params.userId, req.params.userId], (err, results) => {
        if (err) { socket.emit('chat message', "Erro ao apresentar as mensagens"); }
        if (results.length > 0) {
            res.json(results);
        } else {
            let arrobj = [];
            arrobj.push({ msg: "Não há mensagem nessa conversa"});
            res.json(arrobj)
        }

    });
});

app.get("/home/messages/:senderId/:reveiverId", (req, res) => {

    db.query('SELECT msg, fk_sender_id, msg_language, sending_data FROM messages WHERE (fk_sender_id = ? AND fk_reciever_id = ?) OR (fk_sender_id = ? AND fk_reciever_id = ?)', [req.params.senderId, req.params.reveiverId, req.params.reveiverId, req.params.senderId], (err, results) => {
        if (err) { socket.emit('chat message', "Erro ao apresentar as mensagens"); }
        if (results.length > 0) {
            res.json(results);
        } else {
            let arrobj = [];
            arrobj.push({ msg: "Não há mensagem nessa conversa" });
            res.json(arrobj)
        }

    });
});

app.get("/home/messages/last/:senderId/:reveiverId", (req, res) => {

    db.query('SELECT msg, msg_language FROM messages WHERE fk_sender_id = ? AND fk_reciever_id = ?', [req.params.senderId, req.params.reveiverId], (err, results) => {
        if (err) { socket.emit('chat message', "Erro ao apresentar as mensagens"); }
        if (results.length > 0) {
            res.json(results[results.length - 1]);
        } else {
            let arrobj = [];
            arrobj.push({ msg: "Não há mensagem nessa conversa" });
            res.json(arrobj)
        }

    });
});

//----------------------------------------- Atualizar um cliente existente
app.put('/user/:id/update', (req, res) => {
    const id = req.params.id;
    const { username, name, email, password, language } = req.body;

    function comp(value1, value2) {
        if (value1 === null || value1 === undefined || value1 === '') {
            return value2;
        }
        if (value1 !== value2) {
            return value1;
        } else {
            return value2;
        }
    }

    db.query('SELECT * FROM users WHERE pk_user_id = ?', [id], (err, results) => {
        if (err) {
            res.status(500).json({ erro: 'Erro no banco de dados, tente novamente.' });
        }
        if (results.length > 0) {

            const existingUser = results[0];
            const newdata = {
                username: comp(username, existingUser.username),
                name: comp(name, existingUser.name),
                email: comp(email, existingUser.email),
                password: comp(password, existingUser.password),
                language: comp(language, existingUser.language)
            };
            //console.log(newdata.username, newdata.name, newdata.email, newdata.password, newdata.language, id)

            db.query('UPDATE users SET username = ?, name = ?, email = ?, password = ?, language = ? WHERE pk_user_id = ?', [newdata.username, newdata.name, newdata.email, newdata.password, newdata.language, id], (err, results) => {
                let arrobj = [];
                if (err) {
                    arrobj.push({ msg: "Erro no banco de dados, tente novamente" })
                    res.status(500).json(arrobj);
                }
                arrobj.push({ msg: "Usuário atualizado com sucesso!" })
                res.json(arrobj);
            });
            //res.json(newdata.username, newdata.name, newdata.email, newdata.password, newdata.language, id);
        } else {
            let arrobj = [];
            arrobj.push({ msg: 'Usuário não encontrado' })
            res.status(400).json(arrobj);
        }

    });
});

app.get("/users/:pt", (req, res) => {
    db.query('SELECT COUNT(*) AS users FROM users WHERE language = ?', [req.params.pt], (err, results) => {
        if (err) {
            res.json({ err: "Erro na BD" });
        } else {
            // Extrair o número de usuários do objeto de resultados
            const numUsers = results[0].users;
            res.json({ users: numUsers });
        }
    });
});


//----------------------------------------- Excluir um cliente
app.delete('/user/:id/delete', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM users WHERE pk_user_id = ?', id, (err, results) => {
        let arrobj = [];
        if (err) {
            arrobj.push({ msg: 'Erro no banco de dados, tente novamente.' })
            res.status(500).json(arrobj);
        }
        arrobj.push({ msg: "Usuário eliminado com sucesso!" })
        res.json(arrobj);
    });
});

//----------------------------------------- Envio de SMS


async function traduzirTexto(texto, idiomaOrigem, idiomaDestino) {
    try {
        const response = await axios.get('https://api.mymemory.translated.net/get', {
            params: {
                q: texto,
                langpair: `${idiomaOrigem}|${idiomaDestino}`
            }
        });

        // Verifica se a resposta foi bem-sucedida
        if (response.status === 200) {
            const traducao = response.data.responseData.translatedText;
            return traducao;
        } else {
            console.log('Erro ao obter a tradução');
        }
    } catch (error) {
        console.error('Ocorreu um erro:', error);
    }
}


io.on('connection', async (socket) => {

    socket.on('chat message', async (msg, user_sender_id, user_reciever_id, languageSender, languageReceiver) => {
        try {
            if (msg.length !== 0) {
                db.query('INSERT INTO messages (fk_sender_id, fk_reciever_id, msg, msg_language) VALUES (?, ?, ?, ?)', [user_sender_id, user_reciever_id, msg, languageSender], (err, results) => {
                    if (err) {
                        io.emit('chat message', msg, "Erro ao gravar a msg na base de dados");
                    }
                    global.msgSendId = results.insertId;
                    global.languageEmissor = languageSender;
                    global.languageReceptor = languageReceiver;
                    console.log(msg)
                    io.emit('chat message', msg, global.msgSendId, user_sender_id, user_reciever_id);
                });
            }
        } catch (e) {
            // TODO handle the failure
            return;
        }
        //console.log(global.msgSendId)
    });

    if (!socket.recovered) {
        // if the connection state recovery was not successful
        try {
            db.query('SELECT msg FROM messages WHERE pk_message_id = ?', [global.msgSendId], (err, results) => {
                if (err) { socket.emit('chat message', "Erro ao apresentar as mensagens"); }
                socket.emit('chat message', results, global.msgSendId, global.languageEmissor, global.languageReceptor);
            });
        } catch (e) {
            // something went wrong
            return;
        }
    }
});




// Iniciar o servidor
server.listen(3000, () => {
    console.log("server running at http://localhost:3000");
});


