package com.example.sca_be.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    //open api bean을 등록해서 기본 정보 설정
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .components(new Components())
                .info(apiInfo());
    }

    private Info apiInfo() {
        return new Info()
                .title("SCA BE Project API") // API 문서 제목
                .description("서강대학교 산학협력프로젝트(캡스톤 디자인) 9조 Spring Boot/React 풀스택 웹 서비스 프로젝트 SCA API 명세서입니다.")
                .version("1.0.0"); //  API 버전
    }
}
