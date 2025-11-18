package com.example.sca_be

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.data.jpa.repository.config.EnableJpaAuditing

@EnableJpaAuditing
@SpringBootApplication
class ScaBeApplication {

	static void main(String[] args) {
		SpringApplication.run(ScaBeApplication, args)
	}

}
