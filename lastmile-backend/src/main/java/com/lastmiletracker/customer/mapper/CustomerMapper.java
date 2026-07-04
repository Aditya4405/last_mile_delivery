package com.lastmiletracker.customer.mapper;

import com.lastmiletracker.customer.dto.CustomerProfileResponse;
import com.lastmiletracker.customer.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.fullName", target = "fullName")
    @Mapping(source = "user.phone", target = "phone")
    @Mapping(source = "user.enabled", target = "enabled")
    CustomerProfileResponse toResponse(Customer customer);
}
