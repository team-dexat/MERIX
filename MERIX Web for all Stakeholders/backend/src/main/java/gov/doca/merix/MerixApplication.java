package gov.doca.merix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MerixApplication {
    public static void main(String[] args) {
        SpringApplication.run(MerixApplication.class, args);
    }
}
