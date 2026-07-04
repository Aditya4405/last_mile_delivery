package com.lastmiletracker.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerProfileResponse {

    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String city;
    private String pincode;
    private boolean enabled;
}
