package com.lastmiletracker.setting.mapper;

import com.lastmiletracker.setting.dto.SystemSettingResponse;
import com.lastmiletracker.setting.entity.SystemSetting;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SystemSettingMapper {

    SystemSettingResponse toResponse(SystemSetting setting);
}
