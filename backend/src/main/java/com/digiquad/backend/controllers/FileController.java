package com.digiquad.backend.controllers;


import com.digiquad.backend.services.FileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


@RestController
@RequestMapping("/upload")
public class FileController {
    private final FileService fileService = new FileService();

    /*
    * startRow: we are considering the first row as 0th row
    * */

    @PostMapping("/parseFile")
    public ResponseEntity<List<List<String>>> parseExcelAndCsvFile(@RequestParam("file")MultipartFile file,
                                                  @RequestParam(value = "startRow", defaultValue = "0") Integer startRow) {
        return fileService.parseExcelAndCsvFile(file, startRow);
    }


    @PostMapping("/generateJSON")
    public String convertXmlFileToJson(@RequestParam("file")MultipartFile file){
        return fileService.generateJSON(file);
    }

}
