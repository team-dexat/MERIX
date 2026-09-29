@echo off
title Merix - Legal Metrology Online Verification System
color 0B

echo ============================================================================
echo   MERIX: Legal Metrology Online Verification System (DoCA, Govt of India)
echo ============================================================================
echo.
echo  [1/3] Checking environment and dependencies...

cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo  Installing frontend dependencies...
    call npm.cmd install
)

echo  [2/3] Launching web browser...
start http://localhost:5173/

echo  [3/3] Starting Merix Dev Server...
echo.
echo ============================================================================
echo   DEMO CREDENTIALS (Pre-configured 1-Click login available on Login Page):
echo   ------------------------------------------------------------------------
echo   * Business Owner : kavitha.traders@merix.tn.gov      / DemoOwner123!
echo   * LMO Officer    : murugan.lmo@merix.tn.gov          / DemoLMO123!
echo   * GATC Lab       : senthil.gatc@merix.tn.gov         / DemoGATC123!
echo   * Admin          : soundararajan.admin@merix.tn.gov  / DemoAdmin123!
echo   * Citizen        : anitha.citizen@gmail.com          / PublicCitizen123!
echo.
echo   App URL: http://localhost:5173/
echo ============================================================================
echo.

call npm.cmd run dev -- --host
pause
