package com.lastmiletracker.user.mapper;

import com.lastmiletracker.user.dto.UserResponse;
import com.lastmiletracker.user.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);
}
