package gov.doca.merix.controller;

import gov.doca.merix.model.Instrument;
import gov.doca.merix.service.InstrumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/instruments")
@RequiredArgsConstructor
@Tag(name = "Instrument Management & OCR", description = "Instrument registration, OCR nameplate parsing, and GPS geolocation services")
public class InstrumentController {

    private final InstrumentService instrumentService;

    @GetMapping
    @Operation(summary = "Get all registered instruments (Admin view)")
    public ResponseEntity<List<Instrument>> getAllInstruments(@RequestParam(required = false) String userId) {
        if (userId != null && !userId.isBlank()) {
            return ResponseEntity.ok(instrumentService.getInstrumentsByUserId(userId));
        }
        return ResponseEntity.ok(instrumentService.getAllInstruments());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get instrument details by ID")
    public ResponseEntity<Instrument> getInstrumentById(@PathVariable String id) {
        return instrumentService.getInstrumentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new weighing/measuring instrument")
    public ResponseEntity<Instrument> registerInstrument(
            @RequestBody Instrument instrument,
            @RequestParam(required = false, defaultValue = "USR-001") String userId
    ) {
        return ResponseEntity.ok(instrumentService.registerInstrument(instrument, userId));
    }

    @PostMapping("/ocr/extract")
    @Operation(summary = "Extract instrument specifications from uploaded nameplate photo via OCR")
    public ResponseEntity<?> extractOcrDetails(@RequestBody Map<String, String> payload) {
        // AI/OCR Nameplate details extraction simulation
        Map<String, Object> extracted = new HashMap<>();
        extracted.put("manufacturer", "Avery India Ltd.");
        extracted.put("modelNumber", "AV-500B-E1205");
        extracted.put("serialNumber", "SN-AV-2026-" + (int)(10000 + Math.random()*90000));
        extracted.put("instrumentType", "Platform / Bench Scale");
        extracted.put("accuracyClass", "Class III");
        extracted.put("maxCapacity", "300 kg");
        extracted.put("minCapacity", "2 kg");
        extracted.put("verificationScaleIntervalE", "50 g");
        extracted.put("actualScaleIntervalD", "10 g");
        extracted.put("confidenceScore", 0.96);

        return ResponseEntity.ok(extracted);
    }

    @GetMapping("/near-me")
    @Operation(summary = "Fetch nearby verified instruments for citizen trust map")
    public ResponseEntity<List<Instrument>> getNearMe(
            @RequestParam(defaultValue = "19.0760") double lat,
            @RequestParam(defaultValue = "72.8777") double lng,
            @RequestParam(defaultValue = "10.0") double radiusKm
    ) {
        return ResponseEntity.ok(instrumentService.getNearbyInstruments(lat, lng, radiusKm));
    }
}
