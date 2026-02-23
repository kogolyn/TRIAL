import express from "express";
import bcrypt from "bcrypt";
const router = express.Router();
import User from "../models/user.model.js";



//CRUD CREATE, READ, UPDATE, DELETE - post,get,put/patch,delete

// get all user
router.get("/", async (req, res) => {
  const users = await User.find();
  if (users) {
    res.status(200).json(users);
    // res.send("Users API")
  } else {
    res.status(500).json({ message: "an error occured" });
  } 
});

// Create a new user
router.post("/signup", async (req, res) => {
  try {
    const {name, email, password, role} = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({ message: "user with that email exists" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({name, email, password: hashedPassword, role});

    console.log(`${req.body.name} user created successfully`);
    res.status(201).json(newUser);

    return;
  } catch (error) {
    console.log(error.message);
    res.status(500).json({message: "an error occurred while creating user"});
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Include ROLE in the response
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//Clean code
router
  .route("/:id")
  .get(async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: `User with ID ${id} not found` });
    }
  })
  .put(async (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, updatedData);
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json(updatedUser);
    }
  })
  .delete(async (req, res) => {
    const id = req.params.id;
    const deleteUser = await User.findByIdAndDelete(id);
    if (!deleteUser) {
      res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(`user with ID ${id} Deleted successfully`);
  });



export default router;