import { NextFunction, Request, Response } from "express"
import UserModel from "../models/user"

export const register = async(
    req: Request, 
    res: Response, 
    next: NextFunction
    ) => {
        try{
            const newUser = new UserModel({
                email: req.body.email,
                username: req.body.username, 
                password: req.body.password
            })
            console.log('newUser', newUser);
            const savedUser = await newUser.save();
            console.log('savedUser', savedUser)
        } catch (err){
            next(err)
        }
}