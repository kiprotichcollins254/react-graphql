import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { RequiredEntityData } from "@mikro-orm/core";
// import { title } from "process";

@Resolver()
export class PostResolver{
   @Query(()=>[Post])
   posts(
    @Ctx() {em} : MyContext):Promise<Post[]>{
    return em.find(Post,{})
   }

   @Query(()=>Post,{nullable:true})
   post(
    @Arg('identifier',()=>Int) id : number,
    @Ctx() {em} : MyContext):Promise<Post | null>{
       return em.findOne(Post,{id})
   }

//    @Mutation - used for updating, inserting i.e changing data
   @Mutation(()=>Post)
   async createPost(
    @Arg('title') title : string,
    @Ctx() {em} : MyContext):Promise<Post>{
        const post = em.create(Post,{title} as RequiredEntityData<Post>);
        await em.persistAndFlush(post);
        return post;
   }

//    update the data
   @Mutation(()=>Post,{nullable:true})
   async updatePost(
    @Arg('id') id : number,
    @Arg('title',()=>String,{nullable:true}) title : string,
    @Ctx() {em} : MyContext):Promise<Post | null>{
        const post = await em.findOne(Post,{id});
        if(!post){
           return null;
        }
        if(typeof title !== "undefined"){
            post.title = title;
            await em.persistAndFlush(post);
        }
        return post;
   }
}