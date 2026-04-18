package com.campus.campusops.controller;

import com.campus.campusops.model.User;
import com.campus.campusops.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor

public class UserController {
    private final UserService userService;

    @GetMapping
    public List<User> getUsers(){
        return userService.getAllUsers();
    }

    @PostMapping
    public User createuser(@RequestBody User user){
        return userService.createuser(user);
    }
}
