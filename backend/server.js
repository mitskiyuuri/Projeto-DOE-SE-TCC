const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");


console.log("Iniciando servidor...");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "doacoes",
  port: 3316
});

db.connect((err) => {
  if (err) {
    console.log("Erro ao conectar ao banco:", err);
    return;
  }
  console.log("Conectado ao MySQL!");
});

app.get("/", (req, res) => {
  res.send("Servidor funcionando!");
});


app.get("/conversas/:id",(req,res)=>{

const id = req.params.id

const sql = `
SELECT 
id_item,
id_remetente,
id_destinatario
FROM mensagens
WHERE id_remetente=? OR id_destinatario=?
GROUP BY id_item,id_remetente,id_destinatario
`

db.query(sql,[id,id],(err,result)=>{

if(err){
res.send("Erro")
}else{
res.json(result)
}

})

})




app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });


app.post("/cadastro", (req, res) => {

  const { nome, email, senha, cidade } = req.body;

  const sql = "INSERT INTO usuarios (nome, email, senha, cidade) VALUES (?, ?, ?, ?)";

  db.query(sql, [nome, email, senha, cidade], (err, result) => {

    if (err) {
      console.log(err);
      res.send("Erro ao cadastrar");
    } else {
      res.send("Usuário cadastrado com sucesso!");
    }

  });

});



app.post("/login", (req,res)=>{

const {email,senha} = req.body

const sql = "SELECT * FROM usuarios WHERE email=? AND senha=?"

db.query(sql,[email,senha],(err,result)=>{

if(err){
res.send("Erro no servidor")
}else{

if(result.length > 0){

res.json({
mensagem:"Login realizado",
usuario: result[0]
})

}else{
res.send("Usuário ou senha incorretos")
}

}

})

})






app.use("/uploads", express.static("uploads"));



app.post("/novo-item", upload.single("foto"), (req, res) => {

  const { titulo, descricao, cidade, id_usuario } = req.body;
  const foto = req.file.filename;

  const sql = "INSERT INTO itens (titulo, descricao, cidade, foto, id_usuario) VALUES (?, ?, ?, ?, ?)";

  db.query(sql, [titulo, descricao, cidade, foto, id_usuario], (err, result) => {

    if (err) {
      console.log(err);
      res.send("Erro ao publicar item");
    } else {
      res.send("Item publicado com sucesso!");
    }

  });

});



app.get("/itens", (req, res) => {

  const sql = "SELECT * FROM itens WHERE status = 'disponivel'";

  db.query(sql, (err, result) => {

    if (err) {
      res.send("Erro ao buscar itens");
    } else {
      res.json(result);
    }

  });

});







app.get("/item/:id", (req, res) => {

  const id = req.params.id;

  const sql = "SELECT * FROM itens WHERE id_item = ?";

  db.query(sql, [id], (err, result) => {

    if (err) {
      res.send("Erro ao buscar item");
    } else {
      res.json(result[0]);
    }

  });

});



app.post("/mensagem", (req, res) => {

  const { id_remetente, id_destinatario, id_item, mensagem } = req.body;

  const sql = "INSERT INTO mensagens (id_remetente, id_destinatario, id_item, mensagem) VALUES (?, ?, ?, ?)";

  db.query(sql, [id_remetente, id_destinatario, id_item, mensagem], (err, result) => {

    if (err) {
      console.log(err);
      res.send("Erro ao enviar mensagem");
    } else {
      res.send("Mensagem enviada");
    }

  });

});



app.get("/mensagens/:item", (req, res) => {

  const id_item = req.params.item;

  const sql = "SELECT * FROM mensagens WHERE id_item = ?";

  db.query(sql, [id_item], (err, result) => {

    if (err) {
      res.send("Erro ao buscar mensagens");
    } else {
      res.json(result);
    }

  });

});



app.get("/usuario/:id", (req, res) => {

  const id = req.params.id;

  const sql = "SELECT * FROM usuarios WHERE id_usuario = ?";

  db.query(sql, [id], (err, result) => {

    if (err) {
      res.send("Erro ao buscar usuário");
    } else {
      res.json(result[0]);
    }

  });

});



app.get("/itens-usuario/:id", (req, res) => {

  const id = req.params.id;

  const sql = "SELECT * FROM itens WHERE id_usuario = ?";

  db.query(sql, [id], (err, result) => {

    if (err) {
      res.send("Erro ao buscar itens");
    } else {
      res.json(result);
    }

  });

});



app.put("/item-doado/:id", (req, res) => {

  const id = req.params.id;

  const sql = "UPDATE itens SET status='doado' WHERE id_item=?";

  db.query(sql,[id],(err,result)=>{

    if(err){
      res.send("Erro ao atualizar item")
    }else{
      res.send("Item marcado como doado")
    }

  })

})


app.get("/itens", (req,res)=>{

const sql="SELECT * FROM itens WHERE status='disponivel'"

db.query(sql,(err,result)=>{

if(err){
res.send("Erro")
}else{
res.json(result)
}

})

})




app.get("/buscar", (req,res)=>{

const cidade=req.query.cidade

const sql="SELECT * FROM itens WHERE cidade=? AND status='disponivel'"

db.query(sql,[cidade],(err,result)=>{

if(err){
res.send("Erro na busca")
}else{
res.json(result)
}

})

})


app.post("/avaliar",(req,res)=>{

const {avaliador_id,avaliado_id,nota,comentario}=req.body

const sql="INSERT INTO avaliacoes (avaliador_id,avaliado_id,nota,comentario) VALUES (?,?,?,?)"

db.query(sql,[avaliador_id,avaliado_id,nota,comentario],(err,result)=>{

if(err){
res.send("Erro ao avaliar")
}else{
res.send("Avaliação enviada")
}

})

})




app.get("/pesquisa", (req, res) => {

  const item = req.query.item
  const cidade = req.query.cidade

  const sql = `
  SELECT * FROM itens 
  WHERE titulo LIKE ? 
  AND cidade LIKE ?
  AND status = 'disponivel'
  `

  db.query(sql, [`%${item}%`, `%${cidade}%`], (err, result) => {

    if (err) {
      res.send("Erro na busca")
    } else {
      res.json(result)
    }

  })

})




app.get("/verificar-mensagens/:id",(req,res)=>{

const id = req.params.id

const sql = `
SELECT COUNT(*) as total
FROM mensagens
WHERE id_destinatario = ?
`

db.query(sql,[id],(err,result)=>{

if(err){
res.send("Erro")
}else{
res.json(result[0])
}

})

})


