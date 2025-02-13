import { Test, TestingModule } from "@nestjs/testing";
import { CityService } from "../services/city.service";
import { CityController } from "./city.controller";
import { Response } from 'express';
import { GetCityDto } from "../entities/get-city.dto";
import { HttpStatus, NotFoundException } from "@nestjs/common";
import { API_RESPONSE_TEXTS } from "src/common/constants/api-response.constants";
import { ApiResponseModel } from "src/models/api-response.model";

const mockCitiesDto: GetCityDto[] = [
    { uuid: "7e8a29e2-62d1-4ec1-ae15-8ff2f777318f", cityName: "Berlin", count: 523, pageNumber: 1 },
    { uuid: "4a7f5c2d-3a10-4a02-a9b3-450839929e43", cityName: "Hamburg", count: 267, pageNumber: 1 },
    { uuid: "0a40416f-aa4c-4b8b-8ce3-e82e664a4cd1", cityName: "Köln", count: 471, pageNumber: 1 },
    { uuid: "09a20ce8-eb77-40f9-99c8-aa4e7dbf6a99", cityName: "München", count: 899, pageNumber: 1 },
];

const mockCitiesBySearchTextDto: GetCityDto[] = [
    { uuid: "7e8a29e2-62d1-4ec1-ae15-8ff2f777318f", cityName: "Berlin", count: 523, pageNumber: 1 },
    { uuid: "f6b6b4e1-d185-47b5-8c94-61502a4e341a", cityName: "Bremen", count: 656, pageNumber: 1 },
    { uuid: "4f53e06f-3ad4-4bc9-a4b7-69368e763ab9", cityName: "Bochum", count: 366, pageNumber: 1 },
    { uuid: "6f4b5b62-0780-45b3-a522-d70e11d3b3c6", cityName: "Bielefeld", count: 888, pageNumber: 1 },
    { uuid: "7f1865a1-0f63-4f0a-b982-173d63617395", cityName: "Bonn", count: 753, pageNumber: 1 },
    { uuid: "7a994933-a111-49d6-892c-472219138b62", cityName: "Braunschweig", count: 54, pageNumber: 2 },
    { uuid: "82215c81-e0e9-43e0-a5e2-56d2c3d47ad6", cityName: "Bottrop", count: 877, pageNumber: 2 },
    { uuid: "80364cf4-bb6a-4d82-945f-b1f6a0efbd7c", cityName: "Bremerhaven", count: 289, pageNumber: 2 },
    { uuid: "a1337e39-525c-4b5b-8e05-5a57f00d983c", cityName: "Bergisch Gladbach", count: 685, pageNumber: 2 },
    { uuid: "8c4e60f1-2fe4-4d48-b2b1-495e0c515ed6", cityName: "Bamberg", count: 248, pageNumber: 2 },

];

const mockCitiesBySearchTextAndPageNuDto: GetCityDto[] = [
    { uuid: "7a994933-a111-49d6-892c-472219138b62", cityName: "Braunschweig", count: 54, pageNumber: 2 },
    { uuid: "82215c81-e0e9-43e0-a5e2-56d2c3d47ad6", cityName: "Bottrop", count: 877, pageNumber: 2 },
    { uuid: "80364cf4-bb6a-4d82-945f-b1f6a0efbd7c", cityName: "Bremerhaven", count: 289, pageNumber: 2 },
    { uuid: "a1337e39-525c-4b5b-8e05-5a57f00d983c", cityName: "Bergisch Gladbach", count: 685, pageNumber: 2 },
    { uuid: "8c4e60f1-2fe4-4d48-b2b1-495e0c515ed6", cityName: "Bamberg", count: 248, pageNumber: 2 },

];

describe('CityController', () => {
    let cityController: CityController;
    let cityServiceSpy: CityService;

    const response = ({
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
    } as any) as Response;

    beforeEach(async () => {
        jest.clearAllMocks();

        cityServiceSpy = {
            getCities: jest.fn(() => mockCitiesDto)
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            controllers: [CityController],
            providers: [{ provide: CityService, useValue: cityServiceSpy }],
        }).compile();

        cityController = module.get<CityController>(CityController);
    });

    it('should be defined', () => {
        expect(cityController).toBeDefined();
    });

    describe('GET /cities', () => {
        it('should return data which is a type of ApiResponse<GetCityDto[]>', async () => {

            await cityController.getCities(response);

            expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(response.send).toHaveBeenCalledWith({
                message: API_RESPONSE_TEXTS.SUCCESS,
                data: mockCitiesDto,
            });
        });

        it('should handle internal server error', async () => {
            jest.spyOn(cityServiceSpy, 'getCities').mockRejectedValue(new Error('Something went wrong'));

            await cityController.getCities(response);

            expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(response.send).toHaveBeenCalledWith({
                message: API_RESPONSE_TEXTS.INTERNAL_ERROR,
                data: null,
            });
            
        });

        it('should not break down when cities is null', async () => {
            
            
            await cityController.getCities(response);

            jest.spyOn(cityServiceSpy, 'getCities').mockResolvedValue(null);

            await cityController.getCities(response);
            
            expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(response.send).toHaveBeenCalledWith({
                message: API_RESPONSE_TEXTS.SUCCESS,
                data: null,
            });
        });

        it('should return data which is a type of ApiResponse<GetCityDto[]> when searchText query parameter is provided', async () => {
            jest.spyOn(cityServiceSpy, 'getCities').mockResolvedValue(mockCitiesBySearchTextDto);

            await cityController.getCities(response, 'B');

            expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(response.send).toHaveBeenCalledWith({
                message: API_RESPONSE_TEXTS.SUCCESS,
                data: mockCitiesBySearchTextDto,
            });
        });

        it('should handle internal server error when searchText query parameter is provided', async () => {

            jest.spyOn(cityServiceSpy, 'getCities').mockRejectedValue(new Error("Something went wrong"));

            await cityController.getCities(response, 'B');

            expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(response.send).toHaveBeenCalledWith({
                message: API_RESPONSE_TEXTS.INTERNAL_ERROR,
                data: null,
            });

            
        });

        it('should not break down when cities is null when searchText query parameter is provided', async () => {
            
            jest.spyOn(cityServiceSpy, 'getCities').mockResolvedValue(null);

            await cityController.getCities(response, 'B');
            
            expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(response.send).toHaveBeenCalledWith({
                message: API_RESPONSE_TEXTS.SUCCESS,
                data: null,
            });
        });

        it('should return Bad Request(400) when provided pageNumber is a text', async () => {
            await cityController.getCities(response, '', 's');

            expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
            expect(response.send).toHaveBeenCalledWith({
                message: API_RESPONSE_TEXTS.BAD_REQUEST,
                data: null,
            });
        })

        it('should work when both pageNumber and searchText are provided>', async () => {
            jest.spyOn(cityServiceSpy, 'getCities').mockResolvedValue(mockCitiesBySearchTextAndPageNuDto);
            await cityController.getCities(response, 'b', '2');

            expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(response.send).toHaveBeenCalledWith({
                message: API_RESPONSE_TEXTS.SUCCESS,
                data: mockCitiesBySearchTextAndPageNuDto,
            });
        });
    })



})