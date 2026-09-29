package gov.doca.merix.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Merix - Legal Metrology Online Verification System API")
                        .version("1.0.0")
                        .description("RESTful API services for the Department of Consumer Affairs (DoCA), Ministry of Consumer Affairs, Food & Public Distribution, Government of India. Supports instrument registration, OCR nameplate parsing, rule-based fee computation, LMO/GATC inspection allocation, digital MPE testing simulator, tamper-evident QR certification, and citizen trust scoring.")
                        .contact(new Contact()
                                .name("Department of Legal Metrology, DoCA")
                                .email("support@merix.gov.in")
                                .url("https://consumeraffairs.gov.in"))
                        .license(new License()
                                .name("Government of India Open Access")
                                .url("https://data.gov.in")))
                .servers(List.of(
                        new Server().url("/api/v1").description("Primary Local REST API Server"),
                        new Server().url("https://merix.gov.in/api/v1").description("Production Government Server")
                ));
    }
}
