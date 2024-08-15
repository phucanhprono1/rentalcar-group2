package fa.training.carrental.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CarImageSorter {

    public static List<String> sortFilePaths(List<String> filePaths) {
        Map<String, String> positionMap = new HashMap<>();
        positionMap.put("front", null);
        positionMap.put("left", null);
        positionMap.put("back", null);
        positionMap.put("right", null);

        for (String filePath : filePaths) {
            if (filePath.contains("/front/")) {
                positionMap.put("front", filePath);
            } else if (filePath.contains("/left/")) {
                positionMap.put("left", filePath);
            } else if (filePath.contains("/back/")) {
                positionMap.put("back", filePath);
            } else if (filePath.contains("/right/")) {
                positionMap.put("right", filePath);
            }
        }

        List<String> sortedFilePaths = new ArrayList<>();
        sortedFilePaths.add(positionMap.get("front"));
        sortedFilePaths.add(positionMap.get("left"));
        sortedFilePaths.add(positionMap.get("back"));
        sortedFilePaths.add(positionMap.get("right"));

        return sortedFilePaths;
    }
}