package com.example.Config;

import com.example.Service.CompanyService;
import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;
import java.util.logging.Level;
import java.util.logging.Logger;


@Singleton
@Startup
public class StartupBean {
    
    private static final Logger LOGGER = Logger.getLogger(StartupBean.class.getName());
    
    @Inject
    private CompanyService companyService;
    
    
    @PostConstruct
    public void init() {
        LOGGER.info("Checking if companies need to be initialized...");
        
        try {
            // Only initialize if there are no companies in the database
            if (!companyService.hasCompanies()) {
                LOGGER.info("Companies table is empty. Initializing with default values...");
                
                // Create some initial companies
                companyService.createCompanyWithUniqueNames("goatdish", "14, dokki", 5);
                companyService.createCompanyWithUniqueNames("dishwinner", "23, nasrcity", 3);
                companyService.createCompanyWithUniqueNames("7ad2", "20,haram ", 4);
                companyService.createCompanyWithUniqueNames("joeel7ara2", "44, medan el mesa7a", 5);
                companyService.createCompanyWithUniqueNames("ay7agahelwa", "19, masr el jadeda", 3);
                
                LOGGER.info("Companies table initialized successfully");
            } else {
                LOGGER.info("Companies already exist in the database. Skipping initialization.");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error initializing companies table", e);
        }
    }
}
