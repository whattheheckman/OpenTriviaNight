using AutoMapper;

namespace OpenTriviaNight.Api;

public sealed class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<GameData, GameUpdateDto>();
    }
}