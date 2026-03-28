package com.lnkz.geoservice.web;

import com.lnkz.geoservice.repository.PlaceRepository;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/geo")
public class GeoController {
    private final PlaceRepository placeRepository;

    public GeoController(PlaceRepository placeRepository) {
        this.placeRepository = placeRepository;
    }

    @GetMapping("/health")
    public String health() {
        return "ok";
    }

    @GetMapping("/nearby")
    public List<PlaceResponse> nearby(
        @RequestParam double lat,
        @RequestParam double lng,
        @RequestParam(defaultValue = "5000") double radiusMeters
    ) {
        return placeRepository.findNearby(lat, lng, radiusMeters).stream()
            .map(place -> new PlaceResponse(place.getId(), place.getName(), place.getCity()))
            .toList();
    }
}
