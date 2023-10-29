import bcrypt from 'bcrypt';
import UserDao from "../dao/user.js";
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../constants.js';

export const createUsers = async (req, res) => {
    try{
      const { username, password, name } = req.body;
  
      if (!username || !password || !name){
        return res.status(400).json({message:"Mandatory params missing!"})
      }
    
      const userDao = new UserDao();
    
      req.body.password = await bcrypt.hash(req.body.password, 10)
      const user = await userDao.createUser(req.body);
    
      res.json({ message: 'User created' });
    }catch(err){
      return res.status(err.status || 200).json({message: err.message})
    }
}

export const loginUser = async (req, res) => {
  try{
      const { username, password } = req.body;

      const userDao = new UserDao();
      const user = await userDao.findByUserName(username);
      bcrypt.compare(password, user.password, (err, result) => {
          if (err || !result) {
              return res.status(401).json({ message: 'Invalid username or password' });
          }

          const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET_KEY);
          res.json({ token });
      });
  }catch(err){
    return res.status(err.status || 200).json({message: err.message})
  }
}

export const updateUser = async (req, res) => {
  try{
    const username = req.params.username;
    const { password, name } = req.body;

    if (req.body.username){
      return res.status(400).json({message:"username cannot be updated!"})
    }

    if (!password && !name){
      return res.status(400).json({message:"Mandatory params missing!"})
    }
  
    
    if (req.body.password){
      req.body.password = await bcrypt.hash(req.body.password, 10)
    }

    const userDao = new UserDao();
    
    await userDao.updateUserByUserName(username, req.body);
  
    res.json({ message: 'User created' });
  }catch(err){
    return res.status(err.status || 200).json({message: err.message})
  }
}