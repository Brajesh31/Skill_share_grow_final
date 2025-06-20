package com.skillsphere.backend.config;
//
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private static final Logger logger = LoggerFactory.getLogger(WebConfig.class);

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadDir = "file:" + System.getProperty("user.dir") + "/uploads/";
        logger.info("Configuring resource handler for /uploads/** to {}", uploadDir);
        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations(uploadDir)
            .setCachePeriod(0); // Disable caching for development
    }
}