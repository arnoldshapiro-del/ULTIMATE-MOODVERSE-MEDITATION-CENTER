# Temporary file for bulk authentication updates

# Update all remaining endpoints to use authorization headers instead of demo_user
# This includes:

# 1. Update all mood-related endpoints
# 2. Update all user profile endpoints  
# 3. Update all social features endpoints
# 4. Update all analytics endpoints
# 5. Update all export endpoints

# The pattern is:
# OLD: user_id: str = "demo_user"
# NEW: authorization: str = Header(None)
#      user_id = await get_authenticated_user_id(authorization)

endpoints_to_update = [
    "/moods/{mood_id}",
    "/moods/stats", 
    "/user/profile",
    "/user/achievements",
    "/achievements/check",
    "/challenges/daily",
    "/challenges/complete",
    "/friends",
    "/friends/request", 
    "/friends/accept",
    "/notifications",
    "/custom-moods",
    "/meditation/session",
    "/analytics/insights", 
    "/analytics/weekly-report",
    "/moods/export/csv"
]

print("Auth patterns identified for bulk update")