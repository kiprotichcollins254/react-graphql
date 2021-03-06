import "reflect-metadata"
import {MikroORM} from "@mikro-orm/core"
import { __prod__ } from "./constants"
import microConfig from "./mikro-orm.config";
import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import { HelloResolver } from "./resolvers/hello";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

const main = async () => {
    const orm = await MikroORM.init(microConfig);
    orm.getMigrator().up(); 

    //holds the server
    const app = express();
    // use the appollo express server
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers:[HelloResolver,PostResolver,UserResolver],
            validate:false,
        }),
        context: () => ({em:orm.em}), ///passes the orm functions
        plugins:[
            ApolloServerPluginLandingPageGraphQLPlayground
        ]
    });
    await apolloServer.start()
    apolloServer.applyMiddleware({ app });
    
    app.listen(4000,()=> {
        console.log("Server stated on localhost :4000")
    })

}
main().catch(err=>{
    console.log(err)
});