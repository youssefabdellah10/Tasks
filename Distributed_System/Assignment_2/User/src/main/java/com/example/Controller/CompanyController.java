package com.example.Controller;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import com.example.Model.Company;
import com.example.Service.CompanyService;

import java.util.List;

@Path("/company")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CompanyController {
    
    @Inject
    CompanyService companyService;
    @GET
    @Path("/all")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllCompanies() {
        try {
            List<Company> companies = companyService.getAllCompanies();
            if (companies == null || companies.isEmpty()) {
                return Response.status(Response.Status.NO_CONTENT)
                        .entity("No companies found")
                        .build();
            }
            List<String> companyNames = companies.stream()
                .map(Company::getCompanyName)
                .collect(java.util.stream.Collectors.toList());
            
            return Response.status(Response.Status.OK)
                    .entity(companyNames)
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving companies: " + e.getMessage())
                    .build();
        }
    }
    @POST
    @Path("/create")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createCompanyWithUniqueNames(
            @QueryParam("name") String companyName,
            @QueryParam("address") String companyAddress,
            @QueryParam("uniqueCount") @DefaultValue("3") int uniqueCount) {
        try {
            Company company = companyService.createCompanyWithUniqueNames(companyName, companyAddress, uniqueCount);
            if (company == null) {
                return Response.status(Response.Status.CONFLICT)
                        .entity("Failed to create company. Company may already exist.")
                        .build();
            }
            java.util.Map<String, Object> resultMap = new java.util.HashMap<>();
            resultMap.put("companyName", company.getCompanyName());
            resultMap.put("companyAddress", company.getCompanyAddress());
            resultMap.put("companyUniqueNames", company.getCompanyUniqueNames());
            
            return Response.status(Response.Status.CREATED)
                    .entity(resultMap)
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error creating company: " + e.getMessage())
                    .build();
        }
    }
}
