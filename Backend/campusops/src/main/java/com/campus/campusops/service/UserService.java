package com.campus.campusops.service;

import  com.campus.campusops.model.User;
import com.campus.campusops.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import  java.util.List;

@Service
@RequiredArgsConstructor

public class UserService {
    private  final UserRepository userRepository;

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public User createuser(User user){
        return  userRepository.save(user);
    }
}
