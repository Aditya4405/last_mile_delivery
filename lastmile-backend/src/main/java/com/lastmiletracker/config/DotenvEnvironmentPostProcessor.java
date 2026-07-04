package com.lastmiletracker.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> dotenvMap = new HashMap<>();
        
        // Find the .env file recursively up to parent directories
        File dotenvFile = findDotenvFile(new File("."), 0);
        if (dotenvFile != null && dotenvFile.exists()) {
            try (BufferedReader reader = new BufferedReader(new FileReader(dotenvFile))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }
                    int eqIdx = line.indexOf('=');
                    if (eqIdx > 0) {
                        String key = line.substring(0, eqIdx).trim();
                        String value = line.substring(eqIdx + 1).trim();
                        
                        // Clean quotes if present
                        if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
                            value = value.substring(1, value.length() - 1);
                        } else if (value.startsWith("'") && value.endsWith("'") && value.length() >= 2) {
                            value = value.substring(1, value.length() - 1);
                        }
                        dotenvMap.put(key, value);
                    }
                }
            } catch (IOException e) {
                System.err.println("Failed to read .env file: " + e.getMessage());
            }
        }

        if (!dotenvMap.isEmpty()) {
            // Add as a low-priority property source so actual environment variables override it
            environment.getPropertySources().addLast(new MapPropertySource("dotenvProperties", dotenvMap));
        }
    }

    private File findDotenvFile(File dir, int depth) {
        if (depth > 5 || dir == null) {
            return null;
        }
        File f = new File(dir, ".env");
        if (f.exists()) {
            return f;
        }
        try {
            return findDotenvFile(dir.getCanonicalFile().getParentFile(), depth + 1);
        } catch (IOException e) {
            return findDotenvFile(dir.getParentFile(), depth + 1);
        }
    }
}
