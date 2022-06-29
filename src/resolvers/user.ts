
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Int, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { RequiredEntityData } from "@mikro-orm/core";
import { User } from "../entities/User";
import argon2 from 'argon2'

// class for multiple inputs
@InputType()
class UsernamePasswordInput{
    @Field()
    username:string
    @Field()
    password:string
}

@ObjectType()
class FieldError{
    @Field()
    field:string;
    @Field()
    message:string;

}

@ObjectType()
class UserResponse{
    @Field(()=>[FieldError],{nullable:true})
    errors?:FieldError[];

    @Field(()=>User,{nullable:true})
    user?:User;
}

@Resolver()
export class UserResolver{
   @Query(()=>[User])
   users(
    @Ctx() {em} : MyContext):Promise<User[]>{
    return em.find(User,{})
   }

   @Query(()=>User,{nullable:true})
   user(
    @Arg('identifier',()=>Int) id : number,
    @Ctx() {em} : MyContext):Promise<User | null>{
       return em.findOne(User,{id})
   }

   @Query(()=>User,{nullable:true})
   userbyUsername(
    @Arg('identifier') username : string,
    @Ctx() {em} : MyContext):Promise<User | null>{
       return em.findOne(User,{username})
   }

//    @Mutation - used for updating, inserting i.e changing data
   @Mutation(()=>UserResponse)
   async registerUser(
    // @Arg('username') username : string,
    @Arg('options') options : UsernamePasswordInput,
    @Ctx() {em} : MyContext):Promise<UserResponse>{
        if(options.username.length <= 2){
            return {
                errors:[
                    {
                        field:"username",
                        message:"lenght must be greater than 2",
                    }
                ]
            }
        }
        

        if(options.password.length <= 4){
            return {
                errors:[
                    {
                        field:"password",
                        message:"lenght must be greater than 4",
                    }
                ]
            }
        }
        const hashedPassword = await argon2.hash(options.password)
        const user = em.create(User,{username:options.username,password:hashedPassword} as RequiredEntityData<User>);
        try{
            await em.persistAndFlush(user);
        }catch(err){
            if(err.code === "23505"){
                return {
                    errors:[{
                        field:"username",
                        message:"Username Already Exist"
                    }]
                }
            }
        }
        return {user};
   }

   @Mutation(()=>UserResponse)
   async loginUser(
    // @Arg('username') username : string,
    @Arg('options') options : UsernamePasswordInput,
    @Ctx() {em} : MyContext):Promise<UserResponse>{
        //get user 
        const user  = await em.findOne(User,{username:options.username})
        if(!user){
            return{
                errors : [{
                  field:"username",
                  message:"Username Does Not Exist",
                }]
            };
        }
        const valid = await argon2.verify( user.password,options.password)
        // const user = em.create(User,{username:options.username,password:hashedPassword} as RequiredEntityData<User>);
        // await em.persistAndFlush(user);
        if(!valid){
            return{
                errors : [{
                  field:"username",
                  message:"Invalid Password",
                }]
            };
        }
        return {user};
   }

//    update the data
   @Mutation(()=>User,{nullable:true})
   async updateUser(
    @Arg('id') id : number,
    @Arg('username',()=>String,{nullable:true}) username : string,
    @Ctx() {em} : MyContext):Promise<User | null>{
        const user = await em.findOne(User,{id});
        if(!user){
           return null;
        }
        if(typeof username !== "undefined"){
            user.username = username;
            await em.persistAndFlush(user);
        }
        return user;
   }

   @Mutation(()=>Boolean)
   async deleteUser(
    @Arg('id') id : number,
    @Ctx() {em} : MyContext):Promise<boolean>{
        await em.nativeDelete(User,{id})
        return true;
   }
}