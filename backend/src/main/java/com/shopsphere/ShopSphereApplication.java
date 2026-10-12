package com.shopsphere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main entry point for the ShopSphere Campus e-commerce application.
 * Developed for B.Tech CSE AU-R24 Full Stack Development Using Java.
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
public class ShopSphereApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShopSphereApplication.class, args);
    }
}
