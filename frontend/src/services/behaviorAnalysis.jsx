class BehaviorAnalyzer {
    constructor() {
        this.thresholds = {
            rageClicks: {
                timeWindow: 1000, // 1초
                minClicks: 3,
            },
            deadClicks: {
                responseTime: 500, // 500ms
            },
            scrollConfusion: {
                directionChanges: 3,
            },
        };
    }

    analyzeBehavior(behaviorData) {
        const frictionPoints = this.detectFrictionPoints(behaviorData);
        const engagement = this.calculateEngagement(behaviorData);
        const navigationPatterns = this.analyzeNavigation(behaviorData);

        return {
            frictionPoints,
            engagement,
            navigationPatterns,
        };
    }

    detectFrictionPoints(data) {
        const frictionPoints = [];

        const clickGroups = this.groupClicksByTime(data.events.filter((e) => e.type === "click"));
        clickGroups.forEach((group) => {
            if (this.isRageClick(group)) {
                frictionPoints.push({
                    type: "RAGE_CLICKS",
                    timestamp: group[0].timestamp,
                    location: group[0].position,
                    severity: this.calculateSeverity(group),
                });
            }
        });

        const scrollPatterns = this.analyzeScrollPatterns(data.events.filter((e) => e.type === "scroll"));
        scrollPatterns.forEach((pattern) => {
            if (pattern.directionChanges > this.thresholds.scrollConfusion.directionChanges) {
                frictionPoints.push({
                    type: "SCROLL_CONFUSION",
                    timestamp: pattern.startTime,
                    location: pattern.depth,
                    severity: "MEDIUM",
                });
            }
        });

        return frictionPoints;
    }

    calculateEngagement(data) {
        return {
            averagePageDuration: this.calculateAveragePageDuration(data),
            scrollDepthDistribution: this.calculateScrollDepthDistribution(data),
            interactionFrequency: this.calculateInteractionFrequency(data),
        };
    }

    groupClicksByTime(clicks) {
        const groups = [];
        let currentGroup = [];

        clicks.forEach((click, index) => {
            if (index === 0) {
                currentGroup.push(click);
                return;
            }

            const timeDiff = click.timestamp - clicks[index - 1].timestamp;
            if (timeDiff <= this.thresholds.rageClicks.timeWindow) {
                currentGroup.push(click);
            } else {
                groups.push(currentGroup);
                currentGroup = [click];
            }
        });

        return groups;
    }

    isRageClick(group) {
        return group.length >= this.thresholds.rageClicks.minClicks;
    }

    calculateSeverity(group) {
        const responseTimes = group.map((click, index) => {
            if (index === 0) return 0;
            return click.timestamp - group[index - 1].timestamp;
        });

        const deadClicks = responseTimes.filter((time) => time <= this.thresholds.deadClicks.responseTime);
        return deadClicks.length / group.length > 0.5 ? "HIGH" : "MEDIUM";
    }

    analyzeScrollPatterns(scrollEvents) {
        let directionChanges = 0;
        let lastDirection = null;
        const patterns = [];

        scrollEvents.forEach((event, index) => {
            const currentDirection = event.depth > (scrollEvents[index - 1]?.depth ?? 0) ? "down" : "up";

            if (lastDirection && currentDirection !== lastDirection) {
                directionChanges++;
            }

            if (directionChanges >= this.thresholds.scrollConfusion.directionChanges) {
                patterns.push({
                    startTime: event.timestamp,
                    directionChanges,
                    depth: event.depth,
                    duration: event.timestamp - scrollEvents[0].timestamp,
                });
            }

            lastDirection = currentDirection;
        });

        return patterns;
    }

    calculateAveragePageDuration(data) {
        const pageDurations = {};
        const pageVisits = {};

        data.events.forEach((event) => {
            if (event.type === "pageview") {
                if (!pageDurations[event.path]) {
                    pageDurations[event.path] = 0;
                    pageVisits[event.path] = 0;
                }

                if (event.duration) {
                    pageDurations[event.path] += event.duration;
                    pageVisits[event.path]++;
                }
            }
        });

        return Object.keys(pageDurations).map((path) => ({
            path,
            averageDuration: pageDurations[path] / pageVisits[path],
        }));
    }

    calculateScrollDepthDistribution(data) {
        const depthDistribution = {};
        const depthRanges = [0, 25, 50, 75, 100];

        data.events.forEach((event) => {
            if (event.type === "scroll") {
                const depthRange = depthRanges.find((range) => event.depth <= range);
                if (!depthDistribution[depthRange]) {
                    depthDistribution[depthRange] = 0;
                }

                depthDistribution[depthRange]++;
            }
        });

        return depthRanges.map((range) => ({
            range,
            count: depthDistribution[range] ?? 0,
        }));
    }

    calculateInteractionFrequency(data) {
        const timeWindows = {};
        const windowSize = 60000; // 1분 단위로 분석

        data.events.forEach((event) => {
            const windowKey = Math.floor(event.timestamp / windowSize);
            if (!timeWindows[windowKey]) {
                timeWindows[windowKey] = {
                    clicks: 0,
                    scrolls: 0,
                    mousemoves: 0,
                };
            }

            switch (event.type) {
                case "click":
                    timeWindows[windowKey].clicks++;
                    break;
                case "scroll":
                    timeWindows[windowKey].scrolls++;
                    break;
                case "mousemove":
                    timeWindows[windowKey].mousemoves++;
                    break;
            }
        });

        return Object.values(timeWindows).map((window) => ({
            clicks: window.clicks,
            scrolls: window.scrolls,
            mousemoves: window.mousemoves,
        }));
    }

    analyzeNavigation(data) {
        const navigationPatterns = [];
        let currentPattern = null;

        data.events.forEach((event) => {
            if (event.type === "pageview") {
                if (currentPattern) {
                    currentPattern.end = event.timestamp;
                    navigationPatterns.push(currentPattern);
                }

                currentPattern = {
                    start: event.timestamp,
                };
            }
        });
    }
}

export default BehaviorAnalyzer;