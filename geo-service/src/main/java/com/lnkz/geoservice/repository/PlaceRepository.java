package com.lnkz.geoservice.repository;

import com.lnkz.geoservice.model.PlaceEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PlaceRepository extends JpaRepository<PlaceEntity, Long> {
    @Query(
        value = """
            SELECT *
            FROM geo_places gp
            WHERE ST_DWithin(
                gp.point::geography,
                ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
                :radiusMeters
            )
            """,
        nativeQuery = true
    )
    List<PlaceEntity> findNearby(
        @Param("latitude") double latitude,
        @Param("longitude") double longitude,
        @Param("radiusMeters") double radiusMeters
    );
}

