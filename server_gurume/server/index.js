// 포트 열고, 서버 연결, db 연결
const express = require('express');
const mongoose = require('mongoose');
const {ApolloServer} = require('apollo-server-express');

const PORT = 4000;
const app = express();
const path = '/server';

const Schema = require('../graphql/schema/index');
const Resolvers = require('../graphql/resolvers/index');
//const Connector = require('./model/index');

mongoose.connect('mongodb://localhost/admin', (err) => {
    if(err) {
        return err;
    }
    return true;
});
// APOLLO 서버 객체 만들어서 미들웨어 연결 필요
// const server = new ApolloServer({ typeDefs : Schema, resolvers : Resolvers, context : Connectors });
//server.applyMiddleware({app, path});

// APOLLO 서버가 존재하지 않을 때 서버 연결 확인 용
 app.get('/', (req, res) => {
    res.json({
        success: true,
    });
});

// 서버 연결
app.listen(PORT, () => console.log(
    `Server is now running on http://localhost:${PORT}`
));