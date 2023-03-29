const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');
const Utilidades = require('../utils/utils');

exports.create = (req, res, next) => {
    const nome = req.body.nome;
    const email = req.body.email;
    const senha = req.body.senha;

    if(nome === undefined || 
       email === undefined || 
       senha === undefined)
    {
        res.status(400).json({
            mensagem: 'Campos não definidos'
        });
    }
    else
    {
        bcrypt.hash(senha, 10).then(senhaCriptografada => {
            Usuario.findOne({
                where: {
                    email: email
                }
            }).then(usuario => {
                if(usuario == undefined)
                {
                    Usuario.create({
                        nome: nome,
                        email: email,
                        senha: senhaCriptografada
                    }).then(usuarioCriado => {
                        res.status(201).json({
                            mensagem: 'Usuario criado',
                            usuario: {
                                id: usuarioCriado.id,
                                nome: usuarioCriado.nome,
                                email: usuarioCriado.email
                            }
                        });
                    }).catch(err => {
                        console.log(err);
                        res.status(500).json({
                            mensagem: 'Erro na criação do usuário!',
                            erro: err
                        });
                    });
                }
                else
                {
                    res.status(401).json({
                        mensagem: 'Usuário já existe'
                    });
                }
            });
        });
    }
}

exports.login = (req, res, next) => {
    const JWT_KEY = Utilidades.JWT_KEY;

    const senha = req.body.senha;
    const email = req.body.email;

    let erro = false;
    let usuarioEncontrado;

    Usuario.findOne({
        where: {
            email: email
        }
    }).then(usuario => {
        if(!usuario)
        {
            erro = true;
            return res.status(401).json({
                mensagem: 'Credenciais inválidas!'
            });
        }
        else
        {
            usuarioEncontrado = usuario;
            return bcrypt.compare(senha, usuario.senha);
        }
    }).then(resultado => {
        if(!erro)
        {
            if(!resultado)
            {
                return res.status(401).json({
                    mensagem: 'Credenciais inválidas!'
                });
            }
            const token = jwt.sign(
                {
                    email: usuarioEncontrado.email
                },
                JWT_KEY,
                {
                    expiresIn: '1h'
                }
            );
            res.status(200).json(
                {
                    token: token,
                    expiresIn: '3600',
                    usuarioId: usuarioEncontrado.id,
                    usuarioEmail: usuarioEncontrado.email
                }
            );
        }
    }).catch(err => {
        console.log(err);
        return res.status(401).json({
            mensagem: 'Credenciais inválidas!'
        });
    });
}

exports.trocarSenha = (req, res, next) => {
    const senha = req.body.senha;
    const id = req.body.id;

    bcrypt.hash(senha, 10).then(senhaCriptografada => {
        Usuario.update({
            senha: senhaCriptografada
        },
        {
            where: {
                id: id
            }
        }).then(resultado => {
            res.status(201).json({
                mensagem: 'Senha alterada'
            });
        });
    });
}

exports.update = (req, res, next) => {
    const id = req.params.id;
    const email = req.body.email;
    const nome = req.body.nome;

    Usuario.update({
        email: email,
        nome: nome
    },
    {
        where: {
            id: id
        }
    }).then(resultado => {
        res.status(201).json({
            mensagem: 'Usuario alterado'
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            mensagem: 'Erro na alteracao do usuário!'
        });
    });
}

exports.getAll = (req, res, next) => {
    Usuario.findAll({
        order: [
            ['nome', 'ASC']
        ],
        attributes: ['id', 'email', 'nome']
    }).then(usuarios => {
        res.status(200).json({
            mensagem: 'Usuarios encontrados',
            usuarios: usuarios
        });
    });
}

exports.getOne = (req, res, next) => {
    const id = req.params.id;
    Usuario.findOne({
        attributes: ['id', 'email', 'nome'],
        where: {
            id: id
        }
    }).then(usuario => {
        res.status(200).json({
            mensagem: 'Usuário encontrado',
            usuario: usuario
        });
    });
}

exports.delete = (req, res, next) => {
    const id = req.params.id;

    Usuario.destroy({
        where: {
            id: id
        }
    }).then(() => {
        res.status(200).json({
            mensagem: 'Usuário excluido!'
        });
    });
}