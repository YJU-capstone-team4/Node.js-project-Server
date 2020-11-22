// 포트 열고, 서버 연결, db 연결
const express = require('express');
const mongoose = require('mongoose');
const {ApolloServer} = require('apollo-server-express');

const PORT = 3333;
const app = express();
const path = '/graphql';

const Schemas = require('../graphql/schema/index');
const Resolvers = require('../graphql/resolvers/index');

mongoose.connect('mongodb+srv://root:root@ycdb.lbktk.mongodb.net/YCDB?retryWrites=true&w=majority', (err) => {
    if(err) {
        return err;
    }
    return true;
});

const testSchema = require('../graphql/schema/shareFlow');
const testResolver = require('../graphql/resolvers/shareFlow');


// APOLLO 서버 객체 만들어서 미들웨어 연결 필요
const server = new ApolloServer({ typeDefs : Schemas, resolvers : Resolvers, playground:true, });
server.applyMiddleware({app, path});

// APOLLO 서버가 존재하지 않을 때 서버 연결 확인 용
//  app.get('/', (req, res) => {
//     res.json({
//         success: true,
//     });
// });

// 서버 연결
app.listen(PORT, () => console.log(
    `Server is now running on http://localhost:${PORT}${path}`
));