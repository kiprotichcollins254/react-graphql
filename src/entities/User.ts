import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User {
    /****use field to id  the hidden field from graphsql exposure */
    @Field(()=>Int) //exposes this field with explicit type
    @PrimaryKey()
    id!: number;


    @Field(()=>String)
    @Property({type:"date",default:"NOW()"})
    createdAt = new Date();

    @Field(()=>String)
    @Property({ type:"date",onUpdate : () => new Date()})
    updatedAt = new Date();

    @Field()
    @Property({type:"text",unique:true})
    username!: string;

    //hidden
    @Property({type:"text"})
    password!: string;

   
}